import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const chat = () => {
    const route = useRoute();
    const {name, uid} = route.params;

    useEffect(() => {
        if (!uid) {
          console.error("UID is undefined");
        }
        // Your logic here
      }, [uid]);
  return (
    <SafeAreaView>
      <Text className='text-5xl text-white'>chat for {name}, with uid: {uid}</Text>
    </SafeAreaView>
  )
}

export default chat