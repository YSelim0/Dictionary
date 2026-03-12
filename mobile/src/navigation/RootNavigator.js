import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import TopicDetailScreen from '../screens/TopicDetailScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 
        The main tabs are the root of the app.
        When you navigate to a screen inside MainTabs, the bottom bar is visible.
      */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      
      {/* 
        Global screens go here. 
        When you navigate to these, they render on top of the tab bar, hiding it. 
      */}
      <Stack.Screen name="TopicDetail" component={TopicDetailScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
    </Stack.Navigator>
  );
}
