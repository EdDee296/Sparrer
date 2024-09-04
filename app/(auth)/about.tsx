import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, set, ref, onValue, update } from "firebase/database";
import * as Location from 'expo-location';
import UpdateLocation from "@/components/UpdateLocation";
import { Slider } from '@react-native-assets/slider'
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import * as geofire from 'geofire-common';
import { ftdb } from '@/FireBaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import Feather from '@expo/vector-icons/Feather';

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
  { label: "minimumweight, 105 pounds (48 kg)", value: "minimumweight" },
  { label: "light flyweight, 108 pounds (49 kg)", value: "light flyweight" },
  { label: "flyweight, 112 pounds (51 kg)", value: "flyweight" },
  { label: "super flyweight, 115 pounds (52 kg)", value: "super flyweight" },
  { label: "bantamweight, 118 pounds (53.5 kg)", value: "bantamweight" },
  { label: "super bantamweight, 122 pounds (55 kg)", value: "super bantamweight" },
  { label: "featherweight, 126 pounds (57 kg)", value: "featherweight" },
  { label: "super featherweight, 130 pounds (59 kg)", value: "super featherweight" },
  { label: "lightweight, 135 pounds (61 kg)", value: "lightweight" },
  { label: "super lightweight, 140 pounds (63.5 kg)", value: "super lightweight" },
  { label: "welterweight, 147 pounds (67 kg)", value: "weltherweight" },
  { label: "super welterweight, 154 pounds (70 kg)", value: "super welterweight" },
  { label: "middleweight, 160 pounds (72.5 kg)", value: "middleweight" },
  { label: "super middleweight, 168 pounds (76 kg)", value: "super middleweight" },
  { label: "light heavyweight, 175 pounds (79 kg)", value: "light heavyweight" },
  { label: "cruiserweight, 200 pounds (91 kg)", value: "cruiserweight" },
  { label: "heavyweight, unlimited", value: "heavyweight" },
];

const about = () => {
  const [loaded, error] = useFonts({
    'BebasNeue': require('@/assets/fonts/BebasNeue-Regular.ttf'),
  });

  const [user, setUser] = useState(null);
  const [tooltip, setTooltip] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigation = useNavigation();

  const [age, setAge] = useState("");
  const [text, setText] = useState('Waiting for location...');
  const [location, setLocation] = useState(null);
  const [img, setImage] = useState('');
  const [valueSports, setValueSports] = useState(null);
  const [valueGender, setValueGender] = useState(null);
  const [valueWeight, setValueWeight] = useState(null);
  const [valueExp, setValueExp] = useState(null);
  const [isFocusSports, setIsFocusSports] = useState(false);
  const [isFocusGender, setIsFocusGender] = useState(false);
  const [isFocusExp, setIsFocusExp] = useState(false);
  const [isFocusWeight, setIsFocusWeight] = useState(false);
  const [value, setValue] = useState(10);
  const [about, setAbout] = useState("");
  const [images, setImages] = useState([null, null, null, null])
  const [wordCount, setWordCount] = useState(0);
  const [geoPoint, setGeoPoint] = useState([0,0]);

  const getLocation = async () => {
    setText('Loading location...');
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    // console.log(location);

    if (location) {
      const { latitude, longitude } = location.coords;
      const loc = await UpdateLocation(latitude, longitude); // Assuming UpdateLocation is properly defined to handle these arguments
      setText(loc[0] + ", " + loc[1] + ", " + loc[2]);
      loc.splice(1,1);
      setLocation(loc);
      setGeoPoint([latitude, longitude]);
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

  const addMoreImage = async (index) => {
    let _image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!_image.canceled) {
      const updatedImages = [...images];
      updatedImages[index] = _image.assets[0].uri;
      setImages(updatedImages);
    }
  };

  const handleTextChange = (text) => {
    const words = text.trim().split(/\s+/);
    const count = words.filter(word => word.length > 0).length;
    setAbout(text);
    setWordCount(count);
  };


  const handleSignUp = async () => {
    // Check if all fields are filled
    if ( !about || !age || !valueSports || !valueGender || !valueExp || !valueWeight || !location || !img ) {
      alert('Please fill in all fields.');
      return;
    }
    
    if (wordCount > 100) {
      alert('Error! Your description exceeds the 100-word limit.');
      return
    }
    
    if (!images) {
      alert('Please upload at least one image.');
      return;
    }

    try {
      if (user) {
        const storage = getStorage();
        const imagePath = `images/${user.uid}/${img.substring(img.lastIndexOf('/') + 1)}.jpeg`;
        const imageRef = storageRef(storage, imagePath);
  
        // Convert the image URI to blob or file
        const response = await fetch(img);
        const blob = await response.blob();
  
        // Upload the image to Firebase Storage
        const snapshot = await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
  
        // Update the user profile with the username and photoURL
        await updateProfile(user, {
          photoURL: downloadURL,
        });
        
        for (let i = 0; i < images.length; i++) {
          if (images[i]) {
            const imagePath1 = `images/${user.uid}/about_images/${images[i].substring(images[i].lastIndexOf('/') + 1)}.jpeg`;
            const imageRef1 = storageRef(storage, imagePath1);
      
            // Convert the image URI to blob or file
            const response1 = await fetch(images[i]);
            const blob1 = await response1.blob();
      
            // Upload the image to Firebase Storage
            const snapshot1 = await uploadBytes(imageRef1, blob1);
          }
        }

        // Optionally, save the user data including the image URL to Firebase Realtime Database or Firestore
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, {
          url: downloadURL,
          location: location,
          sport: valueSports,
          gender: valueGender,
          exp: valueExp,
          age: age,
          weight: valueWeight,
          radius: value,
          about: about,
        }).then(async () => {
          if (geoPoint) {
            const hash = geofire.geohashForLocation(geoPoint);
            await setDoc(doc(ftdb, "radius", user.uid), {
              geohash: hash,
              lat: geoPoint[0],
              lng: geoPoint[1],
              uid: user.uid
            });
          }
        }).then(() => {
          // console.log("Done uploading all data to Firebase Realtime Database");
          //@ts-ignore
          navigation.navigate('(tabs)', { screen: 'index' });
        });
      }
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const database = getDatabase();
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, async (snapshot) => {
          const data = await snapshot.val();
          if (data) {
            if (data.tooltipShown === undefined) {
              // Set tooltipShown to false for new users
              await set(userRef, { ...data, tooltipShown: false });
              setTooltip(false);
            } else {
              setTooltip(data.tooltipShown);
            }
          }
          setLoading(false); // Set loading to false after fetching data
        });
      } else {
        setLoading(false); // Set loading to false if no user is logged in
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#221111] items-center justify-center">
        <ActivityIndicator size="large" color="red" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#221111]">
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
  {user ? (
    tooltip ? (
      <View>
        <Text className='text-white'>please do change in settings</Text>
      </View>
    ) : (
      <SafeAreaView className="flex-1 bg-[#221111] items-center justify-start">
        <View className="w-full bg-[#221111] p-4 pb-2 items-center justify-between">
          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-3xl font-bold text-center px-12">Join the boxing community</Text>
        </View>

        <View className='flex justify-center items-center pt-10'>
          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-base font-medium pb-2">Profile picture</Text>
          <View className="h-[100px] w-[100px] align-middle bg-[#efefef] rounded-full overflow-hidden shadow flex items-center justify-center">
            <TouchableOpacity onPress={addImage} className="flex-1 items-center justify-center">
              <View className="flex-1 items-center justify-center">
                {img && <Image source={{ uri: img }} style={{ width: 100, height: 100 }} />}
                <AntDesign name="camera" size={20} color="black" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="w-3/4">
          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2 py-2">About you</Text>
          <TextInput
            className='w-full bg-[#221111] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4 h-[200px]'
            value={about}
            onChangeText={handleTextChange}
            placeholder="Tell us about yourself (your gym, your boxing style, ...)"
            placeholderTextColor="[#ffffff]"
            multiline={true}
            textAlignVertical="top"
          />
          <Text style={{ marginLeft: wordCount > 100 ? wordCount > 1000 ? 1000: 1010 : 1020, color: wordCount > 100 ? 'red' : 'white' }}>
            Word count: {wordCount}/100
          </Text>
        </View>

        <View className="w-3/4">
          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2 py-2">Age</Text>
          <TextInput
            className='w-full h-14 bg-[#221111] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4'
            value={age}
            onChangeText={setAge}
            placeholder="Age"
            placeholderTextColor="[#ffffff]"
          />
        </View>

        <View className='grid grid-cols-1 gap-4 content-center justify-center py-3 w-3/4'>
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

        <View className='py-3 w-3/4'>
          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2 ">Location</Text>
          <View className="flex-row justify-center items-center p-2 space-x-4 border border-gray-200 rounded-xl">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-center">{text}</Text>
            <TouchableOpacity onPress={getLocation} className="bg-[#ff2424] p-3 rounded-lg">
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-center">Share Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className='py-3 w-3/4'>
          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2">Radius for searching</Text>
          <View className="flex justify-center items-center">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2">{value} KM</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={100}
                value={value}
                step={10}
                onValueChange={setValue}
                minimumTrackTintColor="blue"
                maximumTrackTintColor="red"
              />
            </View>
          </View>
        </View>

        <View className="w-3/4 py-6">
          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2">Add more image about you</Text>
          <View className="flex flex-1 flex-row flex-wrap justify-center items-center w-full">
            {images.map((img, index) => (
              <View key={index} style={{ width: Platform.OS === 'ios' || Platform.OS ==='android' ? '100%' : '50%', paddingVertical: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ height: 250, width: 200, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: 'white', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, display: 'flex', justifyContent: 'center' }}>
                <TouchableOpacity onPress={() => addMoreImage(index)} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {img && <Image source={{ uri: img }} style={{ width: 200, height: 350, resizeMode: 'cover' }} />}
                    <Feather name="plus-square" size={24} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            ))}
          </View>
        </View>

        <View className="flex-1 justify-center items-center ">
          <TouchableOpacity onPress={handleSignUp} className="w-full bg-[#ff2424] p-4 mx-4 my-6 rounded-xl">
            <View className="flex justify-center items-center">
              <Text style={{ fontFamily: 'BebasNeue' }} className='text-center text-[#ffffff] font-bold text-xl'>Sign up</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  ) : (
    <View>
      <Text className='text-white'>please sign in</Text>
    </View>
  )}
  </ScrollView>
</SafeAreaView>
  );
};

export default about;


const styles = StyleSheet.create({
  sliderContainer: {
    width: '80%', // Adjust the width as needed
    alignItems: 'center',
  },
  slider: {
    width: Platform.OS === 'web' ? '100%' : 350, // Adjust the width based on platform
    height: 40,
    flexGrow: 0,
    borderWidth: 1,
    borderColor: "black",
    borderStyle: "solid",
    alignContent: "center",
    flex: 1,
  },
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