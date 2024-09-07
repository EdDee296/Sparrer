import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Modal, TextInput, ScrollView, Image, Platform } from 'react-native';
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
import Slider from '@react-native-assets/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as Sref, listAll, getDownloadURL, uploadBytes, getMetadata } from "firebase/storage";

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
const storage = getStorage(getApp());

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
  const [name, setName] = useState('');
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

  const [radius, setRadius] = useState(0);
  const [rVisible, setRvisible] = useState(false);

  const [initAbout, setInitAbout] = useState('');
  const [about, setAbout] = useState('');
  const [aVisible, setAvisible] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const [img, setImg] = useState([null, null, null, null]);
  const [names, setNames] = useState([null, null, null, null]);

  const auth = getAuth();
  const navigation = useNavigation();

  const getImg = async (uid) => {
    const listRef = Sref(storage, `images/${uid}/about_images`);
    try {
      const res = await listAll(listRef);
      const urls = await Promise.all(res.items.map(itemRef => getDownloadURL(itemRef)));
      const metadata = await Promise.all(res.items.map(itemRef => getMetadata(itemRef)));
      const names = metadata.map(meta => meta.name);
      return [urls, names];
    } catch (error) {
      alert("error fetching images " + error);
      return [];
    }
  };

  const addMoreImage = async (url, index) => {
    try {
      let _image = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!_image.canceled) {
        console.log('Image selected:', _image.assets[0].uri);
  
        const updatedImages = [...img];
        updatedImages[index] = _image.assets[0].uri;
        setImg(updatedImages);

        if (url) {
          const imgRef = Sref(storage, `images/${uid}/about_images/${names[index]}`);
          // Convert the image URI to blob or file
          const response1 = await fetch(_image.assets[0].uri);
          const blob1 = await response1.blob();
          await uploadBytes(imgRef, blob1, { contentType: 'image/jpeg' });
        } else {
          const imgRef = Sref(storage, `images/${uid}/about_images/${updatedImages[index].substring(updatedImages[index].lastIndexOf('/') + 1)}.jpeg`);
          // Convert the image URI to blob or file
          const response1 = await fetch(_image.assets[0].uri);
          const blob1 = await response1.blob();
          await uploadBytes(imgRef, blob1, { contentType: 'image/jpeg' });
        }
        
      } else {
        console.log('Image selection canceled');
      }
    } catch (error) {
      console.error('Error in addMoreImage:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
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
            if (data.location){
              setLocation(data.location[0]);
            }
            setAbout(data.about);
            setInitAbout(data.about);
            setSports(data.sport);
            setName(data.name);
            setRadius(data.radius);
          } else {
            // User is signed out, reset state
            setUser(null);
            setUid(null);
            setWeight(null);
            setLocation(null);
          }
        })
        const images = await getImg(authUser.uid);
        let img = images[0];
        let names = images[1];

        // Ensure the img array always has 4 elements
        while (img.length < 4) {
          img.push(null);
          names.push(null);
        }
        setNames(names);
        setImg(img);
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

  const handleTextChange = (text) => {
    const words = text.trim().split(/\s+/);
    const count = words.filter(word => word.length > 0).length;
    setAbout(text);
    setWordCount(count);
  };

  const getLocation = async () => {
    setText("Loading location...");
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
  
    const location = await Location.getCurrentPositionAsync({});
    console.log(location);
  
    if (location) {
      const { latitude, longitude } = location.coords;
      const loc = await UpdateLocation(latitude, longitude); // Assuming UpdateLocation is properly defined to handle these arguments
      setText(loc[0] + "," + loc[1] + "," + loc[2]);
      loc.splice(1,1);
      // console.log(loc)
      setLocation(loc);
    }
  };

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center justify-center bg-[#221111]">
          {user ? (
            <>
              <UploadImage/>
              <View className="flex flex-row items-center justify-center">
                <Text style={{fontFamily: 'BebasNeue'}} className="text-lg my-5 text-[#ffffff] mr-2">Welcome champ <Text className='text-2xl'>{name}👑</Text></Text>
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
                    <View className="bg-[#7e7575] w-full h-1/2 rounded-lg">
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-xl text-center">Edit your name</Text>
                      <View className="flex justify-center items-center">
                        <View className="flex items-center justify-center">
                        <TextInput
                          className='w-full h-14 bg-[#221111] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4 my-6'
                          value={user.displayName}
                          onChangeText={(text) => {setUser({ ...user, displayName: text }); setName(text);}}
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

              <View className="flex flex-row items-center justify-center py-2">
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-xl mr-3">Bio:</Text>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-lg mr-3 max-w-md">{about}</Text>
                </View>
                <TouchableOpacity onPress={() => { setAvisible(true) }}>
                  <Feather name="edit" size={24} color="white" />
                </TouchableOpacity>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={aVisible}
                  onRequestClose={() => {
                    alert('Modal has been closed.');
                  }}>
                  <View className="flex-1 justify-center items-center bg-opacity-50">
                    <View className="bg-[#7e7575] w-full h-auto rounded-lg p-6">
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-xl text-white text-center mb-4">Edit your bio</Text>
                      <TextInput
                        className="w-full bg-[#221111] border border-[#7b7b7b] rounded-xl text-[#ffffff] p-4 mb-4"
                        value={about}
                        onChangeText={handleTextChange}
                        placeholder="Tell us about yourself (your gym, your boxing style, ...)"
                        placeholderTextColor="#ffffff"
                        multiline={true}
                        textAlignVertical="top"
                      />
                      <Text style={{ color: wordCount > 100 ? 'red' : 'white', textAlign: 'right', marginBottom: 16 }}>
                        Word count: {wordCount}/100
                      </Text>
                      <View className="flex-1 justify-center items-center bg-opacity-50">
                        <TouchableOpacity
                          className="rounded-2xl w-1/3 p-4 shadow-md bg-[#ff2424] mb-4 mx-2"
                          onPress={() => {
                            if (wordCount <= 100) {
                            const re = ref(database, 'users/' + uid); // Get the user data
                            update(re, {
                              about: about
                            }).then(() => setAvisible(false));
                          } else {
                            alert('Your bio is too long!');
                            return;
                          }
                          }}
                        >
                          <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-center text-xl">Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="rounded-2xl w-1/3 p-4 shadow-md bg-[#ff2424] mx-2"
                          onPress={() => {
                            setAbout(initAbout);
                            setAvisible(false);
                          }}
                        >
                          <Text style={{ fontFamily: 'BebasNeue' }} className="text-center text-xl">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>

              <View className="flex flex-row items-center justify-center py-2">
              <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-xl mr-3">Weight class:</Text>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-lg mr-3">{weight}</Text>
                </View>
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
                    <View className="bg-[#7e7575] w-full h-1/2 rounded-lg">
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-xl text-white text-center">Edit your weight class</Text>
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
                            <Text style= {{fontFamily: 'BebasNeue'}} className="text-white text-center text-xl">Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                          className="rounded-2xl mt-6 p-4 shadow-md bg-[#ff2424]"
                          onPress={() => {
                            setWvisible(false);
                          }}>
                            <Text style={{ fontFamily: 'BebasNeue' }} className="text-center text-xl ">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>

              <View className="flex flex-row items-center justify-center py-2">
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-xl mr-3">Location:</Text>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-lg mr-3">{location}</Text>
                </View>
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
                    <View className="bg-[#7e7575] w-full h-1/2 rounded-lg">
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-xl text-center text-white mb-6">Update your location</Text>
                      <View className="flex justify-center items-center">
                        <View className="flex items-center justify-center">
                          <View className="flex justify-center items-center p-2 space-x-4 border border-gray-200 rounded-xl">
                            <TouchableOpacity onPress={getLocation} className="bg-[#ff2424] p-3 rounded-lg my-4">
                              <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-center">Share Location</Text>
                            </TouchableOpacity>
                            <Text style={{ fontFamily: 'BebasNeue' }} className="text-white justify-center items-center text-center">{text}</Text>
                          </View>
                          <TouchableOpacity
                            className="rounded-2xl p-4 shadow-md bg-[#ff2424] my-6"
                            onPress={() => {
                              const re = ref(database, 'users/' + uid); // Get the user data
                              update(re, {
                                location: location,
                              }).then( () => {
                                setLocation(location[0]);
                                setLvisible(false)});
                              }}>
                            <Text style= {{fontFamily: 'BebasNeue'}} className="text-white text-center text-xl ">Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                          className="rounded-2xl p-4 shadow-md bg-[#ff2424]"
                          onPress={() => {
                            setLvisible(false);
                          }}>
                            <Text style={{ fontFamily: 'BebasNeue' }} className="text-center text-xl ">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>

              <View className="flex flex-row items-center justify-center py-2">
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-xl mr-3">Sports:</Text>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-lg mr-3">{sports}</Text>
                </View>
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
                    <View className="bg-[#7e7575] w-full h-1/2 rounded-lg">
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-xl text-white text-center">Edit your sports</Text>
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
                            <Text style= {{fontFamily: 'BebasNeue'}} className="text-white text-center text-xl">Save</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                          className="rounded-2xl mt-6 p-4 shadow-md bg-[#ff2424]"
                          onPress={() => {
                            setSvisible(false);
                          }}>
                            <Text style={{ fontFamily: 'BebasNeue' }} className="text-center text-xl ">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
              
              <View className="flex flex-row items-center justify-center py-2">
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-xl mr-3">Radius:</Text>
                  <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-lg mr-3">{radius} Km</Text>
                </View>
                <TouchableOpacity onPress={ () => setRvisible(true)}>
                  <Feather name="edit" size={24} color="white" />
                </TouchableOpacity>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={rVisible}
                  onRequestClose={() => {
                    alert('Modal has been closed.');
                  }}>
                  <View className="flex-1 justify-center items-center  bg-opacity-50">
                    <View className="bg-[#7e7575] w-full h-1/2 rounded-lg">
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-xl text-white text-center">Edit your radius</Text>
                      <View className="flex justify-center items-center my-6">
                        <View className="flex items-center justify-center">
                          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-lg font-medium pb-2 ">{radius} KM</Text>
                          <Slider
                              style={{
                                width: Platform.OS === 'web' ? 600 : 400,
                                height: 40,
                                flexGrow: 0,
                                borderWidth: 1,
                                borderColor: "black",
                                borderStyle: "solid",
                                alignContent: "center",
                                flex: 1,
                              }}
                              minimumValue={10}
                              maximumValue={100}
                              value={radius}
                              step={10}
                              onValueChange={setRadius}
                              minimumTrackTintColor="blue"
                              maximumTrackTintColor="red"
                          />
                          <TouchableOpacity
                            className="rounded-2xl mt-6 p-4 shadow-md bg-[#ff2424]"
                            onPress={() => {
                              const re = ref(database, 'users/' + uid); // Get the user data
                              update(re, {
                                radius: radius
                              }).then( () => setRvisible(false));
                              }}>
                            <Text style= {{fontFamily: 'BebasNeue'}} className="text-white text-center text-xl">Save</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                          className="rounded-2xl mt-6 p-4 shadow-md bg-[#ff2424]"
                          onPress={() => {
                            setRvisible(false);
                          }}>
                            <Text style={{ fontFamily: 'BebasNeue' }} className="text-center text-xl ">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>

              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ fontFamily: 'BebasNeue', textAlign: 'center' }} className="text-white text-xl mb-3">Your Photos:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {img.map((img, index) => (
                    <View key={index} style={{ width: Platform.OS === 'ios' || Platform.OS ==='android' ? '100%' : '50%', paddingVertical: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ height: 250, width: 200, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: 'white', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, display: 'flex', justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => {addMoreImage(img, index); console.log(img)}} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
              
              <View className="flex justify-center items-center ">
                <TouchableOpacity onPress={handleSignOut} className=" bg-[#ff2424] p-4 mx-4 my-6 rounded-xl">
                  <View className="flex justify-center items-center">
                    <Text style={{ fontFamily: 'BebasNeue' }} className='w-40 text-center text-[#ffffff]  text-xl'>Sign out</Text>
                  </View>
                </TouchableOpacity>
              </View>

            </>
          ): (
            <Button title="Please Sign in" onPress={() => navigation.navigate('(auth)', { screen: 'sign-in' })} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileTab;


const styles = StyleSheet.create({
  container: {
    backgroundColor: '[#221111]',
  },
  dropdown: {
    height: 50,
    width: 150,
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