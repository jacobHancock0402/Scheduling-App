import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './screens/HomeScreen';
import SubjectsScreen from './screens/SubjectsScreen';
import SubTopicsScreen from './screens/SubTopicsScreen';
import OrderedTopicsScreen from './screens/OrderedTopicsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Topics" component={OrderedTopicsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="SubTopics" component={SubTopicsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 