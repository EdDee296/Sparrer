import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Modal } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';
import UploadImage from '@/components/Upload';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { getDatabase, onValue, ref } from 'firebase/database';
import { getApp } from 'firebase/app';
import Feather from '@expo/vector-icons/Feather';

SplashScreen.preventAutoHideAsync();

const database = getDatabase(getApp());

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
  const [weight, setWeight] = useState('null');
  const [location, setLocation] = useState('null');
  const [sports, setSports] = useState('null');
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser({
          displayName: authUser.displayName,
          email: authUser.email,
        });

        const userRef = ref(database, 'users/' + authUser.uid); // Get the user data
        onValue(userRef, async (snapshot) => {
          const data = await snapshot.val();
          if (data) {
            setWeight(data.weight);
            setLocation(data.location[0]);
            setSports(data.sport);
          }
        });
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
          <View className="flex flex-row items-center justify-center">
            <Text style={{fontFamily: 'BebasNeue'}} className="text-lg my-5 text-[#ffffff] mr-2">Welcome champ <Text className='text-2xl'>{user.displayName}👑</Text> </Text>
            <TouchableOpacity>
              <Feather name="edit" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex flex-row items-center justify-center">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-xl mr-3">Weight class: {weight}</Text>
            <TouchableOpacity>
              <Feather name="edit" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex flex-row items-center justify-center">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-xl mr-3">Location: {location}</Text>
            <TouchableOpacity>
              <Feather name="edit" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex flex-row items-center justify-center">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-xl mr-3">Sports: {sports}</Text>
            <TouchableOpacity>
              <Feather name="edit" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex justify-center items-center ">
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