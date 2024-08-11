import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';
import UploadImage from '@/components/Upload';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get('window');

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
  const [modalVisible, setModalVisible] = useState(false);
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
              <TouchableOpacity onPress={() => setModalVisible(true)} className=" bg-[#ff2424] p-4 mx-4 my-2 rounded-xl">
                <View className="flex justify-center items-center">
                  <Text style={{ fontFamily: 'BebasNeue' }} className='w-40 text-center text-[#ffffff]  text-xl'>edit profile</Text>
                </View>
              </TouchableOpacity>
              <Modal
              className="h-full"
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                alert('Modal has been closed.');
                setModalVisible(!modalVisible);
              }}>
                <View className="flex-1 bg-[#e34d4d] justify-center items-center mt-6 h-full">
                    <View className="m-5 h-full w-full rounded-2xl p-9 items-center shadow-lg shadow-black/25">
                      <Text style= {{fontFamily: 'BebasNeue'}} className="mb-4 text-center text-white text-3xl">edit profile</Text>
                      <TouchableOpacity onPress={() => setModalVisible(false)} className=" bg-[#4c2dd8] p-4 mx-4 my-6 rounded-xl">
                        <View className="flex justify-center items-center">
                          <Text style={{ fontFamily: 'BebasNeue' }} className='w-40 text-center text-[#ffffff]  text-xl'>Save</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                </View>
              </Modal>
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