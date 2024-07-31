import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './(auth)/authContext';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

const SparrApp = () => {
  const [loaded, error] = useFonts({
    'BebasNeue': require('../assets/fonts/BebasNeue-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  const navigation = useNavigation();

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaView className="flex-1 bg-[#221111] justify-center items-center">
        <ScrollView>
          <Text
            style={{ fontFamily: 'BebasNeue' }}
            className="flex text-white text-5xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12 pr-12 pb-11 align-middle justify-center"
          >
            Sparrer
          </Text>
          <View className="w-full h-2/3 px-4 py-3">
            <Image
              source={{ uri: 'https://cdn.usegalileo.ai/sdxl10/9adffc69-06f8-4d52-b212-519f5c1d0dbd.png' }}
              className="w-full h-full bg-cover bg-center justify-end rounded-xl overflow-hidden bg-[#221111]"
            />
          </View>
          <Text
            style={{ fontFamily: 'BebasNeue' }}
            className="text-white text-3xl font-bold leading-tight px-4 text-center pb-3 pt-5"
          >
            Find your next sparring partner
          </Text>
          <Text
            style={{ fontFamily: 'BebasNeue' }}
            className="text-white text-2xl font-normal leading-normal pt-1 px-4 text-center"
          >
            Join the largest community of boxers in the world. Find a sparring partner, track your progress, and compete in challenges.
          </Text>
          <View className="flex justify-center items-stretch w-full px-4 py-2">
            <TouchableOpacity
              className="flex h-10 items-center justify-center rounded-xl px-4 bg-[#ff2929] leading-normal tracking-[0.015em] w-full mt-2"
              onPress={() => {
                navigation.navigate('(auth)', { screen: 'sign-up' });
              }}
            >
              <Text style={{ fontFamily: 'BebasNeue' }} className="truncate text-2xl text-white font-bold">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
          <Link href={'/sign-in'} className="flex justify-center">
            <Text
              style={{ fontFamily: 'BebasNeue' }}
              className="truncate text-[#7a7a7a] font-white text-center pt-3 underline"
            >
              Already have an account? Sign in
            </Text>
          </Link>
          <View className="h-5 bg-[#221111]" />
        </ScrollView>
      </SafeAreaView>
    </AuthProvider>
  );
};

export default SparrApp;