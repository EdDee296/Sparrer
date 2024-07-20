import React, { useState } from 'react';
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


  const dataSport = [
    { label: 'Boxing', value: 'Boxing' },
    { label: 'Kickboxing', value: 'Kickboxing' },
    { label: 'MMA', value: 'MMA' },
  ];

  const dataGender = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Women' },
  ];

  const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Added state for username
  const [text, setText] = useState('Waiting for location...');
  const [location, setLocation] = useState(null); 
  const [img, setImage] = useState('');
  const navigation = useNavigation();

  const [valueSports, setValueSports] = useState(null);
  const [valueGender, setValueGender] = useState(null);
  const [isFocusSports, setIsFocusSports] = useState(false);
  const [isFocusGender, setIsFocusGender] = useState(false);

  const renderSportsLabel = () => {
    if (valueSports || isFocusSports) {
      return (
        <Text style={[styles.label, isFocusSports && { color: 'white' }]}>
          Select a sport
        </Text>
      );
    }
    return null;
  };

  const renderGenderLabel = () => {
    if (valueGender || isFocusGender) {
      return (
        <Text style={[styles.label, isFocusGender && { color: 'white' }]}>
          Select your biology sex
        </Text>
      );
    }
    return null;
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
            <View className='grid grid-cols-1 gap-4 content-center justify-center'>
              <View style={styles.container}>
                  {renderSportsLabel()}
                  <Dropdown
                    style={[styles.dropdown, isFocusSports && { borderColor: 'white' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataSport}
                    search
                    maxHeight={300}
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
                  {renderGenderLabel()}
                  <Dropdown
                    style={[styles.dropdown, isFocusGender && { borderColor: 'white' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataGender}
                    search
                    maxHeight={100}
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
            </View>
            
            <TouchableOpacity onPress={getLocation} className="mt-4 bg-blue-500 p-3 rounded-lg">
              <Text className=" text-[#ffffff] text-center">Get Location</Text>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    padding: 16,
  },
  dropdown: {
    height: 50,
    width: 500,
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
    backgroundColor: 'black',
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