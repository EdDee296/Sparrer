import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { AntDesign } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SimpleLineIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        tabBarInactiveTintColor: '#838383',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name='home' color={color} />
          ),
          headerShown: false,
          headerStyle: {
            backgroundColor: '#000000', // Replace '#yourColor' with your desired color
          },
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Challenges',
          tabBarIcon: ({color}) => (
            <SimpleLineIcons name="trophy" size={24} color={color} />
          ),
          headerShown: false,
          headerStyle: {
            backgroundColor: '#000000', // Replace '#yourColor' with your desired color
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({color}) => (
            <FontAwesome name="user-o" size={24} color={color} />
          ),
          headerShown: false,
          headerStyle: {
            backgroundColor: '#000000', // Replace '#yourColor' with your desired color
          },
        }}
      />
      
    </Tabs>
  );
}
