import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as databaseRef, set } from "firebase/database";
import * as Location from 'expo-location';
import UpdateLocation from "@/components/UpdateLocation";
import { auth } from '@/FireBaseConfig';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

const dataSport = [
  { label: 'Boxing', value: 'Boxing' },
  { label: 'Kickboxing', value: 'Kickboxing' },
  { label: 'MMA', value: 'MMA' },
];

const dataGender = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Women' },
];

const dataExp = [
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
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

const SignUp = () => {  
  const [loaded, error] = useFonts({
    'BebasNeue': require('@/assets/fonts/BebasNeue-Regular.ttf'),
  });

  const [age, setAge] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Added state for username
  const [text, setText] = useState('Waiting for location...');
  const [location, setLocation] = useState(null); 
  const [img, setImage] = useState('');
  const navigation = useNavigation();

  const [valueSports, setValueSports] = useState(null);
  const [valueGender, setValueGender] = useState(null);
  const [valueWeight, setValueWeight] = useState(null);
  const [valueExp, setValueExp] = useState(null);
  const [isFocusSports, setIsFocusSports] = useState(false);
  const [isFocusGender, setIsFocusGender] = useState(false);
  const [isFocusExp, setIsFocusExp] = useState(false);
  const [isFocusWeight, setIsFocusWeight] = useState(false);
  

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
      console.log("City: " + loc[0] + " State: " + loc[1] + " Country: " + loc[2]);
      setText("City: " + loc[0] + " State: " + loc[1] + " Country: " + loc[2]);
      loc.splice(1,1);
      setLocation(loc);
    }
  };

  const addImage = async () => {
    let _image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!_image.canceled) {
      setImage(_image.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    // Check if all fields are filled
    if (!username || !email || !password || !age || !valueSports || !valueGender || !valueExp || !valueWeight || !location || !img) {
      alert('Please fill in all fields.');
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Account created:', userCredential.user);
      if (userCredential.user) {
        const storage = getStorage();
        const imagePath = `images/${userCredential.user.uid}/${img.substring(img.lastIndexOf('/') + 1)}.jpeg`;
        const imageRef = storageRef(storage, imagePath);
  
        // Convert the image URI to blob or file
        const response = await fetch(img);
        const blob = await response.blob();
  
        // Upload the image to Firebase Storage
        const snapshot = await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
  
        // Update the user profile with the username and photoURL
        await updateProfile(userCredential.user, {
          displayName: username,
          photoURL: downloadURL,
        });
  
        // Optionally, save the user data including the image URL to Firebase Realtime Database or Firestore
        const db = getDatabase();
        await set(databaseRef(db, 'users/' + userCredential.user.uid), {
          name: username,
          email: email,
          uid: userCredential.user.uid,
          url: downloadURL,
          location: location,
          sport: valueSports,
          gender: valueGender,
          exp: valueExp,
          age: age,
          weight: valueWeight,
        }).then(() => {
          console.log("Done uploading all data to Firebase Realtime Database");
          //@ts-ignore
          navigation.navigate('(tabs)', { screen: 'index' });
        });
      }
    } catch (error) {
      console.error('Error signing up and uploading image:', error);
      // Handle errors here, such as showing an error message
    }
  };

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#221111] items-center justify-start">
      <ScrollView className="w-full h-full">
        <View className="w-full bg-[#221111] p-4 pb-2 items-center justify-between">
          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-3xl font-bold text-center px-12">Join the boxing community</Text>
        </View>

        <View className='flex justify-center items-center pt-10'>
        <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-base font-medium pb-2">Profile picture</Text>
          <View className=" h-12 w-12 align-middle  bg-[#efefef] rounded-full overflow-hidden shadow flex items-center justify-center">
            <TouchableOpacity onPress={addImage} className="flex-1 items-center justify-center">
              <View className="flex-1 items-center justify-center">
                 {img && <Image source={{ uri: img }} style={{ width: 50, height: 50 }} />}
                <AntDesign name="camera" size={20} color="black" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="w-full max-w-480 flex-1 flex-wrap items-end gap-4 py-5">
          <View className="flex-1 flex-col w-full">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2">Username</Text>
            <TextInput
              className='w-full h-14 bg-[#221111] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4'
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="[#ffffff]"
            />

            <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2 py-2">Email</Text>
            <TextInput
              className='w-full h-14 bg-[#221111] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4 py-2'
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="[#ffffff]"
            />

            <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2 py-2">Password</Text>
            <TextInput
              className='w-full h-14  border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4'
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="[#ffffff]"
              secureTextEntry
            />

            <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2 py-2">Age</Text>
            <TextInput
              className='w-full h-14 bg-[#221111] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4'
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor="[#ffffff]"
            />

            <View className='grid grid-cols-1 gap-4 content-center justify-center py-3'>
              <View style={styles.container}>
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2">Sport</Text>
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
                    value={valueSports}
                    onFocus={() => setIsFocusSports(true)}
                    onBlur={() => setIsFocusSports(false)}
                    onChange={item => {
                      setValueSports(item.value);
                      setIsFocusSports(false);
                      console.log(item.value);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusSports ? 'white' : 'black'}
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
              </View>
              <View style={styles.container}>
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2">Biology sex</Text>
                  <Dropdown
                    fontFamily='BebasNeue'
                    style={[styles.dropdown, isFocusGender && { borderColor: 'white' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataGender}
                    search
                    maxHeight={1000}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocusGender ? 'Select your biology sex' : '...'}
                    searchPlaceholder="Search..."
                    value={valueGender}
                    onFocus={() => setIsFocusGender(true)}
                    onBlur={() => setIsFocusGender(false)}
                    onChange={item => {
                      setValueGender(item.value);
                      setIsFocusGender(false);
                      console.log(item.value);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusGender ? 'white' : 'black'}
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
              </View>
              <View style={styles.container}>
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2">Level of experience</Text>
                  <Dropdown
                    fontFamily='BebasNeue'
                    style={[styles.dropdown, isFocusExp && { borderColor: 'white' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataExp}
                    search
                    maxHeight={1000}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocusExp ? 'Select your level of experience' : '...'}
                    searchPlaceholder="Search..."
                    value={valueExp}
                    onFocus={() => setIsFocusExp(true)}
                    onBlur={() => setIsFocusExp(false)}
                    onChange={item => {
                      setValueExp(item.value);
                      setIsFocusExp(false);
                      console.log(item.value);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusGender ? 'white' : 'black'}
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
              </View>
              <View style={styles.container}>
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2">Weight class</Text>
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
                    value={valueWeight}
                    onFocus={() => setIsFocusWeight(true)}
                    onBlur={() => setIsFocusWeight(false)}
                    onChange={item => {
                      setValueWeight(item.value);
                      setIsFocusWeight(false);
                      console.log(item.value);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusGender ? 'white' : 'black'}
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
              </View>
            </View>

            <View className='py-3'>
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2 ">Location</Text>
              <View className="flex-row justify-center items-center p-2 space-x-4 border border-gray-200 rounded-xl">
                <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-center">{text}</Text>
                <TouchableOpacity onPress={getLocation} className="bg-[#ff2424] p-3 rounded-lg">
                  <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-center">Share Location</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View className="flex justify-center items-center ">
              <TouchableOpacity onPress={handleSignUp} className="w-1/2 bg-[#ff2424] p-4 mx-4 my-6 rounded-xl">
              <View className="flex justify-center items-center">
                <Text style={{ fontFamily: 'BebasNeue' }} className='text-center text-[#ffffff] font-bold text-xl'>Sign up</Text>
              </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

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