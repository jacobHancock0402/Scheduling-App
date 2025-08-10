import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

import {
  DAMPING_FACTOR,
  CONVERSION_FACTORS,
  STORAGE_KEYS,
  DEFAULT_SUBTOPIC_CONFIG,
} from '../../constants/constants';
import {
  limitValue,
  parseRGB,
  createRGBString,
  calculateSM2Score,
  calculateEasingFactor,
  getNextInterval,
} from '../../utils/helpers';

export default function SubTopicsScreen({ navigation, route }) {
  const [textT, setTextT] = useState('');
  const [textS, setTextS] = useState('');
  const [data, setData] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [currentTopic] = useState(route.params?.topic || '');

  const navigateToSubject = (name) => {
    navigation.replace('SubTopics', { topic: name });
  };

  const handleInput = (text, type) => {
    if (type === 'topic') {
      setTextT(text);
    } else {
      setTextS(text);
    }
  };

  const createNewTopic = (topicName) => {
    const time = Date.now();
    return {
      ...DEFAULT_SUBTOPIC_CONFIG,
      name: [topicName],
      parent: currentTopic,
      sm2_timeStart: time,
    };
  };

  const createNewSubject = (subjectName) => {
    return {
      subjects: [],
      topics: [],
      parent: currentTopic,
      colour: 'rgb(0,255,0)',
      name: subjectName,
    };
  };

  const submitInput = async (type) => {
    try {
      let storedTopics = await AsyncStorage.getItem(STORAGE_KEYS.TOPICS);
      let topicsData = JSON.parse(storedTopics);

      if (type === 'topic') {
        const newTopic = createNewTopic(textT);
        topicsData[currentTopic].topics.push(newTopic);
        setTopics([...topics, newTopic]);
        setTextT('');
      } else {
        const newSubject = createNewSubject(textS);
        topicsData[textS] = newSubject;
        topicsData[currentTopic].subjects.push({
          text: textS,
          colour: 'rgb(0,255,0)',
        });

        setSubjects([...subjects, { text: textS, colour: 'rgb(0,255,0)', name: textS }]);
        setTextS('');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topicsData));
      setData(topicsData);
    } catch (error) {
      console.error('Error submitting input:', error);
    }
  };

  const resetTopic = async (item, change) => {
    try {
      const index = topics.findIndex(topic => topic.name === item);
      if (index === -1) return;

      const newChange = parseRGB(change);
      const oldColour = parseRGB(topics[index].colour);

      const newRed = limitValue(255, 0, 
        oldColour.red + (DAMPING_FACTOR * newChange.red) - newChange.green
      );
      const newGreen = limitValue(255, 0, 
        oldColour.green + (DAMPING_FACTOR * newChange.green) - newChange.red
      );

      const sm2Score = calculateSM2Score(newChange.green);
      const easingFactor = calculateEasingFactor(topics[index].efactor, sm2Score);

      let nextRep = topics[index].nextRep + 1;
      if (sm2Score < 3) {
        nextRep = 2;
      }

      const interval = getNextInterval(topics[index].intervals, nextRep, easingFactor);
      const sm2Conversion = CONVERSION_FACTORS.SM2_CONVERSION;

      if (nextRep > 2) {
        topics[index].intervals[nextRep] = interval;
        data[currentTopic].topics[index].intervals[nextRep] = interval;
      }

      const colour = createRGBString(newRed, newGreen, 40);
      const timeStart = Date.now() - (newRed / CONVERSION_FACTORS.TOPIC_DECAY) * 1000;
      const sm2TimeStart = Date.now();

      const updatedTopic = {
        ...topics[index],
        timeStart,
        sm2_conversion: sm2Conversion,
        interval,
        sm2_timeStart: sm2TimeStart,
        efactor: easingFactor,
        sm2_colour: 'rgb(0,255,40)',
        colour,
        nextRep,
      };

      topics[index] = updatedTopic;
      data[currentTopic].topics[index] = updatedTopic;

      setTopics([...topics]);
      setData({ ...data });

      await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(data));
    } catch (error) {
      console.error('Error resetting topic:', error);
    }
  };

  const calculateSubjectDecay = async () => {
    try {
      let storedTopics = await AsyncStorage.getItem(STORAGE_KEYS.TOPICS);
      let topicsData = JSON.parse(storedTopics);

      if (!topicsData || !topicsData[currentTopic]) return;

      const topicSubjects = topicsData[currentTopic].subjects;
      topicSubjects.forEach(subject => {
        if (topicsData[subject.text]) {
          subject.colour = topicsData[subject.text].colour;
        }
      });

      // Sort by color (green component)
      topicSubjects.sort((a, b) => {
        const colorA = parseRGB(a.colour);
        const colorB = parseRGB(b.colour);
        return colorB.green - colorA.green;
      });

      setSubjects(topicSubjects);
      topicsData[currentTopic].subjects = topicSubjects;
      await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topicsData));
    } catch (error) {
      console.error('Error calculating subject decay:', error);
    }
  };

  const calculateDecay = async () => {
    try {
      await calculateSubjectDecay();

      const updatedTopics = topics.map(topic => {
        const oldColour = parseRGB(topic.colour);
        const time = Date.now();
        const timeStart = topic.timeStart;
        const visualDiff = oldColour.red;
        const diff = ((time - timeStart) / 1000) * CONVERSION_FACTORS.TOPIC_DECAY;
        const newDiff = diff - visualDiff;

        let green = limitValue(255, 0, oldColour.green - newDiff);
        let red = limitValue(255, 0, oldColour.red + newDiff);

        const sm2PercentOfInterval = (Date.now() - topic.sm2_timeStart) / (60 * 60 * 24 * topic.interval);
        const sm2Red = sm2PercentOfInterval * 255;
        const sm2Green = 255 - sm2Red;
        const sm2Colour = createRGBString(sm2Red, sm2Green, 40);

        const colour = createRGBString(red, green, 40);

        return {
          ...topic,
          colour,
          sm2_colour: sm2Colour,
          changeColour: 'rgb(0,255,0)',
          timeStart,
        };
      });

      // Sort by timeStart
      updatedTopics.sort((a, b) => a.timeStart - b.timeStart);

      setTopics(updatedTopics);
      if (data[currentTopic]) {
        data[currentTopic].topics = updatedTopics;
        setData({ ...data });
        await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error calculating decay:', error);
    }
  };

  const deleteTopic = async (name, type) => {
    try {
      let storedTopics = await AsyncStorage.getItem(STORAGE_KEYS.TOPICS);
      let topicsData = JSON.parse(storedTopics);

      if (type === 'subjects') {
        const index = topicsData[currentTopic].subjects.findIndex(subject => subject.text === name);
        if (index !== -1) {
          topicsData[currentTopic].subjects.splice(index, 1);
          delete topicsData[name];
        }
      } else {
        const index = topicsData[currentTopic].topics.findIndex(topic => topic.name[0] === name[0]);
        if (index !== -1) {
          topicsData[currentTopic].topics.splice(index, 1);
        }
      }

      await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topicsData));
      setData(topicsData);
      setTopics(topicsData[currentTopic]?.topics || []);
      setSubjects(topicsData[currentTopic]?.subjects || []);
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const createDeleteAlert = (item, type) => {
    Alert.alert(
      'Are You Sure?',
      'This deletion is irreversible',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => deleteTopic(item, type) },
      ],
      { cancelable: true }
    );
  };

  const colourChange = async (name, rgb, value) => {
    try {
      const index = topics.findIndex(topic => topic.name === name);
      if (index === -1) return;

      const newColour = createRGBString(value, 255 - value, 0);

      topics[index].changeColour = newColour;
      data[currentTopic].topics[index] = topics[index];

      setTopics([...topics]);
      setData({ ...data });

      await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(data));
    } catch (error) {
      console.error('Error changing colour:', error);
    }
  };

  const switchData = () => {
    const newCurrentData = isSwitchOn ? topics : subjects;
    if (newCurrentData !== currentData) {
      setCurrentData(newCurrentData);
    }
  };

  useEffect(() => {
    switchData();
  }, [isSwitchOn, topics, subjects]);

  useEffect(() => {
    calculateDecay();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      calculateDecay();
    }, [])
  );

  const renderTopicItem = ({ item }) => {
    if (isSwitchOn) {
      return (
        <View style={styles.itemContainer}>
          <View style={[styles.colourBar, { backgroundColor: item.colour }]}>
            <Text style={styles.itemTitle}>{item.name}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={255}
            onValueChange={(value) => colourChange(item.name, item.changeColour, value)}
            minimumTrackTintColor="rgb(255,0,0)"
            maximumTrackTintColor="rgb(0,255,0)"
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: item.changeColour }]}
            onPress={() => resetTopic(item.name, item.changeColour)}
          >
            <Text style={styles.buttonText}>Revised?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => createDeleteAlert(item.name, 'topics')}
          >
            <Text style={styles.buttonText}>Delete This Topic</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.itemContainer}>
          <View style={[styles.colourBar, { backgroundColor: item.colour }]}>
            <Text style={styles.itemTitle}>{item.text}</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigateToSubject(item.text)}
          >
            <Text style={styles.buttonText}>View Topics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => createDeleteAlert(item.text, 'subjects')}
          >
            <Text style={styles.buttonText}>Delete This Topic</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Switch
          trackColor={{ false: 'blue', true: 'green' }}
          ios_backgroundColor="#3e3e3e"
          onValueChange={setIsSwitchOn}
          value={isSwitchOn}
        />
        <Text style={styles.headerText}>{currentTopic}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add A Topic"
          value={textT}
          onChangeText={(text) => handleInput(text, 'topic')}
          onSubmitEditing={() => submitInput('topic')}
        />
        <TextInput
          style={styles.input}
          placeholder="Add A Subject"
          value={textS}
          onChangeText={(text) => handleInput(text, 'subject')}
          onSubmitEditing={() => submitInput('subject')}
        />
      </View>

      <FlatList
        style={styles.list}
        extraData={currentData}
        data={currentData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderTopicItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    padding: 16,
    gap: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  colourBar: {
    padding: 20,
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 