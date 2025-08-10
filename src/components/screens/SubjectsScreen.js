import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import {
  CONVERSION_FACTORS,
  STORAGE_KEYS,
  DEFAULT_TOPIC_CONFIG,
} from '../../constants/constants';
import { parseRGB, createRGBString } from '../../utils/helpers';

export default function SubjectsScreen({ navigation }) {
  const [topic, setTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [data, setData] = useState({});

  const navigateToTopic = (title) => {
    navigation.navigate('SubTopics', { topic: title });
  };

  const handleInput = (text) => {
    setTopic(text);
  };

  const createNewTopic = (topicName) => {
    return {
      ...DEFAULT_TOPIC_CONFIG,
      name: topicName,
    };
  };

  const submitInput = async () => {
    if (!topic.trim()) return;

    try {
      let storedTopics = await AsyncStorage.getItem(STORAGE_KEYS.TOPICS);
      let topicsData = storedTopics ? JSON.parse(storedTopics) : {};

      const newTopic = createNewTopic(topic.trim());
      topicsData[topic.trim()] = newTopic;

      await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topicsData));
      await AsyncStorage.setItem(STORAGE_KEYS.TIME_START, JSON.stringify(Date.now()));

      setTopic('');
      navigation.navigate('SubTopics', { topic: topic.trim() });
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const deleteSubject = async (subject) => {
    try {
      let storedTopics = await AsyncStorage.getItem(STORAGE_KEYS.TOPICS);
      let topicsData = JSON.parse(storedTopics);

      delete topicsData[subject];

      await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topicsData));
      await calculateSubjectDecay();
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const createDeleteAlert = (item) => {
    Alert.alert(
      'Are You Sure?',
      'This deletion is irreversible',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => deleteSubject(item) },
      ],
      { cancelable: true }
    );
  };

  const calculateTopicDepth = (topicsData, topicKey) => {
    let depth = 0;
    let parent = topicsData[topicKey].parent;
    
    while (parent !== null && topicsData[parent]) {
      depth += 1;
      parent = topicsData[parent].parent;
    }
    
    return depth;
  };

  const calculateTopicColor = (topicsData, topicKey) => {
    const topic = topicsData[topicKey];
    let totalRed = 0;
    let totalGreen = 0;
    let count = 0;

    // Calculate from subtopics
    topic.topics?.forEach(subTopic => {
      const time = Date.now();
      const timeStart = subTopic.timeStart || 0;
      const diff = ((time - timeStart) / 1000) * CONVERSION_FACTORS.SUBJECT_DECAY;
      const red = Math.min(255, Math.max(0, diff));
      const green = Math.min(255, Math.max(0, 255 - diff));
      
      totalRed += red;
      totalGreen += green;
      count++;
    });

    // Calculate from subjects
    topic.subjects?.forEach(subject => {
      if (topicsData[subject.text]) {
        const subjectColor = topicsData[subject.text].colour;
        const rgb = parseRGB(subjectColor);
        totalRed += rgb.red;
        totalGreen += rgb.green;
        count++;
      }
    });

    if (count > 0) {
      return createRGBString(
        Math.round(totalRed / count),
        Math.round(totalGreen / count),
        0
      );
    }
    
    return topic.colour;
  };

  const calculateSubjectDecay = async () => {
    try {
      let storedTopics = await AsyncStorage.getItem(STORAGE_KEYS.TOPICS);
      let topicsData = JSON.parse(storedTopics);

      if (!topicsData) return;

      // Calculate depth for each topic
      const keys = Object.keys(topicsData).map(key => ({
        key,
        depth: calculateTopicDepth(topicsData, key),
      }));

      // Sort by depth
      keys.sort((a, b) => b.depth - a.depth);

      // Calculate colors for each topic
      keys.forEach(item => {
        const newColor = calculateTopicColor(topicsData, item.key);
        topicsData[item.key].colour = newColor;
      });

      await AsyncStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topicsData));

      // Get root topics (no parent) and sort by color
      const rootTopics = {};
      const rootKeys = [];
      
      Object.keys(topicsData).forEach(key => {
        if (topicsData[key].parent === null) {
          rootTopics[key] = topicsData[key];
          rootKeys.push(key);
        }
      });

      // Sort by color (red component)
      rootKeys.sort((a, b) => {
        const colorA = parseRGB(rootTopics[a].colour);
        const colorB = parseRGB(rootTopics[b].colour);
        return colorA.red - colorB.red;
      });

      setTopics(rootKeys);
      setData(rootTopics);
    } catch (error) {
      console.error('Error calculating subject decay:', error);
    }
  };

  const calculateLargestDecay = async () => {
    try {
      let storedTopics = await AsyncStorage.getItem(STORAGE_KEYS.TOPICS);
      let topicsData = JSON.parse(storedTopics);

      if (!topicsData) return;

      let worstScore = Infinity;
      let worstTopic = null;

      Object.keys(topicsData).forEach(key => {
        topicsData[key].topics?.forEach(topic => {
          if (topic.timeStart < worstScore) {
            worstScore = topic.timeStart;
            worstTopic = topic;
          }
        });
      });

      if (worstTopic) {
        const seconds = Math.round((Date.now() - worstScore) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(seconds / 3600);
        const days = Math.round(seconds / (24 * 3600));

        let formattedTime = '';
        if (days > 0) {
          formattedTime = `${days} Days`;
        } else if (hours > 0) {
          formattedTime = `${hours} Hours`;
        } else if (minutes > 0) {
          formattedTime = `${minutes} Minutes`;
        } else {
          formattedTime = `${seconds} Seconds`;
        }

        // You can uncomment this to show alerts
        // Alert.alert(
        //   `You Should Revise ${worstTopic.name}`,
        //   `You haven't revised it in ${formattedTime}`,
        //   [
        //     { text: 'OK', style: 'cancel' },
        //     { text: 'See All Topics', onPress: () => navigation.push('OrderedTopics') },
        //   ],
        //   { cancelable: true }
        // );
      }
    } catch (error) {
      console.error('Error calculating largest decay:', error);
    }
  };

  useEffect(() => {
    calculateSubjectDecay();
    calculateLargestDecay();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      calculateSubjectDecay();
      calculateLargestDecay();
    }, [])
  );

  const renderTopicItem = ({ item }) => (
    <View style={[styles.topicCard, { backgroundColor: data[item]?.colour || '#ccc' }]}>
      <Text style={styles.topicTitle}>{data[item]?.name || item}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigateToTopic(data[item]?.name || item)}
        >
          <Text style={styles.buttonText}>View Topics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => createDeleteAlert(data[item]?.name || item)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Create a Subject"
        value={topic}
        onChangeText={handleInput}
        onSubmitEditing={submitInput}
      />
      <FlatList
        style={styles.list}
        data={topics}
        extraData={topics}
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  list: {
    flex: 1,
  },
  topicCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 