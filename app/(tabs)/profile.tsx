import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Modal, TextInput } from 'react-native';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';
import UploadImage from '@/components/Upload';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { getDatabase, onValue, ref, update } from 'firebase/database';
import { getApp } from 'firebase/app';
import Feather from '@expo/vector-icons/Feather';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Location from 'expo-location';
import UpdateLocation from '@/components/UpdateLocation';

SplashScreen.preventAutoHideAsync();

const dataSport = [
  { label: 'Boxing', value: 'Boxing' },
  { label: 'Kickboxing', value: 'Kickboxing' },
  { label: 'MMA', value: 'MMA' },
];

const dataWeight = [
  {label: "minimumweight, 105 pounds (48 kg)", value: "minimumweight"},
  {label: "light flyweight, 108 pounds (49 kg)", value: "light flyweight"},
  {label: "flyweight, 112 pounds (51 kg)", value: "flyweight"},
  {label: "super flyweight, 115 pounds (52 kg)", value: "super flyweight"},
  {label: "bantamweight, 118 pounds (53.5 kg)", value: "bantamweight"},
  {label: "super bantamweight, 122 pounds (55 kg)", value: "super bantamweight"},
  {label: "featherweight, 126 pounds (57 kg)", value: "featherweight"},
  {label: "super featherweight, 130 pounds (59 kg)", value: "super featherweight"},
  {label: "lightweight, 135 pounds (61 kg)", value: "lightweight"},
  {label: "super lightweight, 140 pounds (63.5 kg)", value: "super lightweight"},
  {label: "welterweight, 147 pounds (67 kg)", value: "weltherweight"},
  {label: "super welterweight, 154 pounds (70 kg)", value: "super welterweight"},
  {label: "middleweight, 160 pounds (72.5 kg)", value: "middleweight"},
  {label: "super middleweight, 168 pounds (76 kg)", value: "super middleweight"},
  {label: "light heavyweight, 175 pounds (79 kg)", value: "light heavyweight"},
  {label: "cruiserweight, 200 pounds (91 kg)", value: "cruiserweight"},
  {label: "heavyweight, unlimited", value: "heavyweight"},
];

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
  const [uid, setUid] = useState('');
  
  const [visible, setVisible] = useState(false);

  const [location, setLocation] = useState(null);
  const [text, setText] = useState('null');
  const [lVisible, setLvisible] = useState(false);

  const [weight, setWeight] = useState('null');
  const [isFocusWeight, setIsFocusWeight] = useState(false);
  const [wVisible, setWvisible] = useState(false);

  const [sports, setSports] = useState('null');
  const [isFocusSports, setIsFocusSports] = useState(false);
  const [sVisible, setSvisible] = useState(false);

  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser({
          displayName: authUser.displayName,
          email: authUser.email,
        });
        setUid(authUser.uid);
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

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
  
    const location = await Location.getCurrentPositionAsync({});
    console.log(location);
  
    if (location) {
      const { latitude, longitude } = location.coords;
      const loc = await UpdateLocation(latitude, longitude); // Assuming UpdateLocation is properly defined to handle these arguments
      setText("City: " + loc[0] + " State: " + loc[1] + " Country: " + loc[2]);
      loc.splice(1,1);
      console.log(loc)
      setLocation(loc);
    }
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
            <TouchableOpacity onPress={() => setVisible(true)}>
              <Feather name="edit" size={24} color="white" />
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={visible}
              onRequestClose={() => {
                alert('Modal has been closed.');
              }}>
              <View className="flex-1 justify-center items-center  bg-opacity-50">
                <View className="bg-[#7e7575] w-2/4 h-1/2 rounded-lg">
                  <Text style={{ fontFamily: 'BebasNeue' }} className="text-xl text-center">Edit your name</Text>
                  <View className="flex justify-center items-center">
                    <View className="flex items-center justify-center">
                    <TextInput
                      className='w-full h-14 bg-[#221111] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4 my-6'
                      value={user.displayName}
                      onChangeText={(text) => setUser({ ...user, displayName: text })}
                      placeholder="Update your name"
                      placeholderTextColor="[#ffffff]"
                    />
                      <TouchableOpacity
                        className="rounded-2xl p-4 shadow-md bg-[#ff2424]"
                        onPress={() => {
                          const re = ref(database, 'users/' + uid); // Get the user data
                          updateProfile(auth.currentUser, {
                            displayName: user.displayName,
                          });
                          update(re, {
                            name: user.displayName,
                          }).then( () => setVisible(false));
                          }}>
                        <Text style= {{fontFamily: 'BebasNeue'}} className="text-black text-center text-xl">Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          </View>

          <View className="flex flex-row items-center justify-center">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-xl mr-3">Weight class: {weight}</Text>
            <TouchableOpacity onPress={() => {setWvisible(true)}}>
              <Feather name="edit" size={24} color="white" />
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={wVisible}
              onRequestClose={() => {
                alert('Modal has been closed.');
              }}>
              <View className="flex-1 justify-center items-center  bg-opacity-50">
                <View className="bg-[#7e7575] w-2/4 h-1/2 rounded-lg">
                  <Text style={{ fontFamily: 'BebasNeue' }} className="text-xl text-center">Edit your weight class</Text>
                  <View className="flex justify-center items-center my-6">
                    <View className="flex items-center justify-center">
                    <Dropdown
                    fontFamily='BebasNeue'
                    style={[styles.dropdown, isFocusWeight && { borderColor: 'white' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataWeight}
                    search
                    maxHeight={1000}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocusWeight ? 'Select your weight class' : '...'}
                    searchPlaceholder="Search..."
                    value={weight}
                    onFocus={() => setIsFocusWeight(true)}
                    onBlur={() => setIsFocusWeight(false)}
                    onChange={item => {
                      setWeight(item.value);
                      setIsFocusWeight(false);
                      console.log(item.value);
                    }}
                  />
                      <TouchableOpacity
                        className="rounded-2xl mt-6 p-4 shadow-md bg-[#ff2424]"
                        onPress={() => {
                          const re = ref(database, 'users/' + uid); // Get the user data
                          update(re, {
                            weight: weight
                          }).then( () => setWvisible(false));
                          }}>
                        <Text style= {{fontFamily: 'BebasNeue'}} className="text-black text-center text-xl">Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          </View>

          <View className="flex flex-row items-center justify-center">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-xl mr-3">Location: {location}</Text>
            <TouchableOpacity onPress={() => setLvisible(true)}>
              <Feather name="edit" size={24} color="white" />
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={lVisible}
              onRequestClose={() => {
                alert('Modal has been closed.');
              }}>
              <View className="flex-1 justify-center items-center  bg-opacity-50">
                <View className="bg-[#7e7575] w-2/4 h-1/2 rounded-lg">
                  <Text style={{ fontFamily: 'BebasNeue' }} className="text-xl text-center mb-6">Update your location</Text>
                  <View className="flex justify-center items-center">
                    <View className="flex items-center justify-center">
                      <View className="flex-row justify-center items-center p-2 space-x-4 border border-gray-200 rounded-xl">
                        <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-center">{text}</Text>
                        <TouchableOpacity onPress={getLocation} className="bg-[#ff2424] p-3 rounded-lg">
                          <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-center">Share Location</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        className="rounded-2xl p-4 shadow-md bg-[#ff2424]"
                        onPress={() => {
                          const re = ref(database, 'users/' + uid); // Get the user data
                          update(re, {
                            location: location,
                          }).then( () => {
                            setLocation(location[0]);
                            setLvisible(false)});
                          }}>
                        <Text style= {{fontFamily: 'BebasNeue'}} className="text-black text-center text-xl">Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          </View>

          <View className="flex flex-row items-center justify-center">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-xl mr-3">Sports: {sports}</Text>
            <TouchableOpacity onPress={ () => setSvisible(true)}>
              <Feather name="edit" size={24} color="white" />
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={sVisible}
              onRequestClose={() => {
                alert('Modal has been closed.');
              }}>
              <View className="flex-1 justify-center items-center  bg-opacity-50">
                <View className="bg-[#7e7575] w-2/4 h-1/2 rounded-lg">
                  <Text style={{ fontFamily: 'BebasNeue' }} className="text-xl text-center">Edit your sports</Text>
                  <View className="flex justify-center items-center my-6">
                    <View className="flex items-center justify-center">
                    <Dropdown
                    fontFamily='BebasNeue'
                    style={[styles.dropdown, isFocusSports && { borderColor: 'white' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataSport}
                    search
                    maxHeight={1000}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocusSports ? 'Select your sport' : '...'}
                    searchPlaceholder="Search..."
                    value={sports}
                    onFocus={() => setIsFocusSports(true)}
                    onBlur={() => setIsFocusSports(false)}
                    onChange={item => {
                      setSports(item.value);
                      setIsFocusSports(false);
                      console.log(item.value);
                    }}
                  />
                      <TouchableOpacity
                        className="rounded-2xl mt-6 p-4 shadow-md bg-[#ff2424]"
                        onPress={() => {
                          const re = ref(database, 'users/' + uid); // Get the user data
                          update(re, {
                            sport: sports
                          }).then( () => setSvisible(false));
                          }}>
                        <Text style= {{fontFamily: 'BebasNeue'}} className="text-black text-center text-xl">Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
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


const styles = StyleSheet.create({
  container: {
    backgroundColor: '[#221111]',
  },
  dropdown: {
    height: 50,
    width: '100%',
    borderColor: 'white',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    color: 'white',
  },
  icon: {
    marginRight: 5,
    color: 'white',
  },
  label: {
    position: 'absolute',
    backgroundColor: '[#221111]',
    color: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'white',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'white',
  },
  iconStyle: {
    width: 20,
    height: 20,
    color: 'white',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16, 
  },
});