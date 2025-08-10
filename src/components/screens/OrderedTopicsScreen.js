import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import {
  MONTHS,
  DAYS,
  STORAGE_KEYS,
  TIME_CONVERSIONS,
} from '../../constants/constants';
import { formatTime } from '../../utils/helpers';

export default function OrderedTopicsScreen() {
  const [topics, setTopics] = useState([]);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isRegular, setIsRegular] = useState(true);

  const sortTopics = (realTopics) => {
    let sorted = false;
    while (!sorted) {
      let counter = 0;
      for (let i = 0; i < realTopics.length - 1; i++) {
        let shouldSwap = false;

        if (isRegular) {
          shouldSwap = realTopics[i].timeStart > realTopics[i + 1].timeStart;
        } else {
          const timeTillReview1 = (realTopics[i].sm2_timeStart + (TIME_CONVERSIONS.MILLISECONDS_PER_DAY * realTopics[i].interval)) - Date.now();
          const timeTillReview2 = (realTopics[i + 1].sm2_timeStart + (TIME_CONVERSIONS.MILLISECONDS_PER_DAY * realTopics[i + 1].interval)) - Date.now();
          shouldSwap = timeTillReview1 > timeTillReview2;
        }

        if (shouldSwap) {
          const copy = realTopics[i];
          realTopics[i] = realTopics[i + 1];
          realTopics[i + 1] = copy;
        } else {
          counter++;
        }
      }

      if (counter === realTopics.length - 1) {
        sorted = true;
      }
    }
    return realTopics;
  };

  const formatRegularTime = (topic) => {
    const seconds = Math.round((Date.now() - topic.timeStart) / 1000);
    const formattedTime = `You haven't revised this in ${formatTime(seconds)}`;
    return {
      ...topic,
      formattedTime,
      displayedColour: topic.colour,
    };
  };

  const formatSM2Time = (topic) => {
    const dateAfterInterval = new Date(topic.sm2_timeStart + (topic.interval * TIME_CONVERSIONS.MILLISECONDS_PER_DAY));
    const digDay = dateAfterInterval.getDate();
    const digMonth = dateAfterInterval.getMonth() + 1;
    const digWeekDay = dateAfterInterval.getDay();
    const digYear = dateAfterInterval.getFullYear();
    const strWeekDay = DAYS[digWeekDay];

    const formattedTime = `You should revise this on ${strWeekDay} ${digDay}/${digMonth}/${digYear}`;
    return {
      ...topic,
      formattedTime,
      displayedColour: topic.sm2_colour,
    };
  };

  const calculateLargestDecay = async () => {
    try {
      let storedTopics = await AsyncStorage.getItem(STORAGE_KEYS.TOPICS);
      let topicsData = JSON.parse(storedTopics);

      if (!topicsData) return;

      const realTopics = [];
      Object.keys(topicsData).forEach(key => {
        topicsData[key].topics?.forEach(topic => {
          realTopics.push(topic);
        });
      });

      // Sort topics based on switch state
      const sortedTopics = sortTopics(realTopics);

      // Format time for each topic
      const formattedTopics = sortedTopics.map(topic => {
        if (isRegular) {
          return formatRegularTime(topic);
        } else {
          return formatSM2Time(topic);
        }
      });

      setTopics(formattedTopics);
    } catch (error) {
      console.error('Error calculating largest decay:', error);
    }
  };

  const handleSwitchChange = (value) => {
    setIsSwitchOn(value);
    setIsRegular(!value);
  };

  useEffect(() => {
    calculateLargestDecay();
  }, [isRegular]);

  useFocusEffect(
    React.useCallback(() => {
      calculateLargestDecay();
    }, [])
  );

  const renderTopicItem = ({ item }) => (
    <View style={[styles.topicCard, { backgroundColor: item.displayedColour }]}>
      <Text style={styles.topicTitle}>{item.name}</Text>
      <Text style={styles.topicTime}>{item.formattedTime}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Switch
          trackColor={{ false: 'blue', true: 'green' }}
          ios_backgroundColor="#3e3e3e"
          onValueChange={handleSwitchChange}
          value={isSwitchOn}
        />
        <Text style={styles.headerText}>
          {isRegular ? 'Regular Intervals' : 'SM2 Intervals'}
        </Text>
      </View>

      <FlatList
        style={styles.list}
        extraData={topics}
        data={topics}
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
    fontSize: 18,
    fontWeight: '600',
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
    marginBottom: 12,
  },
  topicTime: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
    opacity: 0.9,
  },
}); 