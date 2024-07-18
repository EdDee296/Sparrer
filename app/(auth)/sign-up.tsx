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

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Added state for username
  const [text, setText] = useState('Waiting for location...');
  const [location, setLocation] = useState(null); 
  const [img, setImage] = useState('');
  const navigation = useNavigation();

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
        });
  
        console.log("Done uploading all data to Firebase Realtime Database");
  
        // Navigate to the next screen or show success message
        // This line is now correctly placed after all awaitable operations have completed
        //@ts-ignore
        navigation.navigate('(tabs)', { screen: 'index' });
      }
    } catch (error) {
      console.error('Error signing up and uploading image:', error);
      // Handle errors here, such as showing an error message
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-start">
      <ScrollView className="w-full h-full">
        <View className="w-full bg-black p-4 pb-2 items-center justify-between">
          <Text className="text-[#ffffff] text-lg font-bold text-center px-12">Sign up</Text>
        </View>

        <View className='flex justify-center items-center'>
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
            <Text className="text-[#ffffff] text-lg font-medium pb-2">Username</Text>
            <TextInput
              className='w-full h-14 bg-[#000000] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4'
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="[#ffffff]"
            />
            <Text className="text-[#ffffff] text-lg font-medium pb-2">Email</Text>
            <TextInput
              className='w-full h-14 bg-[#000000] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4'
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="[#ffffff]"
            />
            <Text className="text-[#ffffff] text-lg font-medium pb-2">Password</Text>
            <TextInput
              className='w-full h-14  border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4'
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#ffffff"
              secureTextEntry
            />
            <TouchableOpacity onPress={getLocation} className="mt-4 bg-blue-500 p-3 rounded-lg">
              <Text className="bg-[#1818ff] text-[#ffffff] text-center">Get Location</Text>
            </TouchableOpacity>
            <View>
              <Text className="text-[#ffffff] text-center" >Location: {text}</Text>
            </View>
            <View className="flex justify-center items-center ">
              <TouchableOpacity onPress={handleSignUp} className="w-1/2 bg-[#4d87e6] p-4 mx-4 my-6 rounded-xl">
              <View className="flex justify-center items-center">
                <Text className='text-center text-[#ffffff]'>Sign up</Text>
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