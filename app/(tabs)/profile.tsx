import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';
import UploadImage from '@/components/Upload';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const UserProfileTab = () => {
  const [loaded, error] = useFonts({
    'BebasNeue': require('@/assets/fonts/BebasNeue-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  const [user, setUser] = useState<any>(null);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser({
          displayName: authUser.displayName,
          email: authUser.email,
        });
      } else {
        setUser(null);
        
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'profile' }], // Navigate to the index screen in the app folder
          })
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  if (!loaded && !error) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center bg-[#221111]">
      {user ? (
        <>
          <UploadImage/>
          <Text style={{fontFamily: 'BebasNeue'}} className="text-lg my-5 text-[#ffffff]">Welcome champ <Text className='text-2xl'>👑{user.displayName}👑</Text> </Text>
          <Text style={{fontFamily: 'BebasNeue'}} className="text-lg text-[#ffffff]">Email: {user.email}</Text>
          <View className="flex justify-center items-center ">
              <TouchableOpacity onPress={() => alert("Navigate to edit profile")} className=" bg-[#ff2424] p-4 mx-4 my-2 rounded-xl">
                <View className="flex justify-center items-center">
                  <Text style={{ fontFamily: 'BebasNeue' }} className='w-40 text-center text-[#ffffff]  text-xl'>edit profile</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut} className=" bg-[#ff2424] p-4 mx-4 my-6 rounded-xl">
                <View className="flex justify-center items-center">
                  <Text style={{ fontFamily: 'BebasNeue' }} className='w-40 text-center text-[#ffffff]  text-xl'>Sign out</Text>
                </View>
              </TouchableOpacity>
            </View>
        </>
      ) : (
        <Button title="Please Sign in" onPress={() => navigation.navigate('(auth)', { screen: 'sign-in' })} />
      )}
    </View>
  );
};

export default UserProfileTab;