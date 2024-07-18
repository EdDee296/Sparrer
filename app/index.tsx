import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { Link, SplashScreen, router, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './(auth)/authContext';

const App = () => {

  SplashScreen.preventAutoHideAsync()

  return (
    <AuthProvider>
      <SafeAreaView className="flex-1 bg-black items-center justify-start">
      <ScrollView>
        <View className="bg-black p-4 pb-2 w-full items-center justify-center">
          <Text className="text-[#ffffff] text-lg font-bold">Challenge</Text>
        </View>
        <View className="w-full p-2 pt-3">
          <ImageBackground
            source={{ uri: 'https://cdn.usegalileo.ai/stability/c2a26f83-ab13-44af-a09b-ac17c13cc4c1.png' }}
            className="w-full h-56 justify-end"
            imageStyle={{ borderRadius: 12 }}
          >
            <View className="flex-1 bg-opacity-40"></View>
          </ImageBackground>
        </View>
        <Text className="text-[#ffffff] text-2xl font-bold text-center pt-5 pb-2 px-4">Take on challenges, with friends.</Text>
        <Text className="text-[#ffffff] text-base text-center px-4 pb-2">Set goals and compete with friends. Challenges are a fun way to stay motivated.</Text>
        <View className="px-4 pb-4 bg-black">
          <TouchableOpacity
           className="bg-cyan-400 rounded-lg h-12 justify-center items-center w-full"
           onPress={() => {router.push('/sign-up')}}>
            <Text className="text-black text-base font-bold">Get Started</Text>
          </TouchableOpacity>
        </View>
        <Link className="text-[#999898] text-sm underline pb-4 text-center" href="/sign-in">Already have an account? Log in.</Link>
        <View className="h-5 bg-black"></View>
      </ScrollView>
    </SafeAreaView>
    </AuthProvider>
    
  );
};

export default App;