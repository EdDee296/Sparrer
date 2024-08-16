import React, { useEffect, useState } from "react";
import { ImageBackground, Modal, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TinderCard from "react-tinder-card";
import { getDatabase, onValue, ref, get, update } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getApp } from "firebase/app";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useNavigation } from "@react-navigation/native";
import { Dimensions } from 'react-native';

SplashScreen.preventAutoHideAsync();

const database = getDatabase(getApp());

const query = (data, currentData) => {
  if (JSON.stringify(data) === JSON.stringify(currentData)) {
    return true;
  } else {
    return false;
  }
};

const ring = require('@/assets/images/ring.jpg');
const glove = require('@/assets/images/gloves.png');
const { width } = Dimensions.get('window');

function Simple() {
  const [loaded, error] = useFonts({
    'BebasNeue': require('@/assets/fonts/BebasNeue-Regular.ttf'),
  });

  const [currentLocation, setLocation] = useState('');
  const [currentGender, setGender] = useState('');
  const [currentUid, setUid] = useState('');
  const [currentImg, setImg] = useState('');
  // const [currentSport, setSport] = useState('');

  const [swipedUserIds, setSwipedUserIds] = useState([]);
  const [characters, setCharacters] = useState([]); // Use this state to hold your fetched data


  const [modalVisible, setModalVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);

  const [matchedImg, setMatchedImg] = useState('');
  const [matchedName, setMatchedName] = useState('');
  const [matchedUid, setMatchedUid] = useState('');

  const [user, setUser] = useState(null);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      const swipesRef = ref(database, `swipes/${user.uid}`);
      onValue(swipesRef, async (snapshot) => {
        const swipesData = await snapshot.val() || {};
        const swipedUserIds = Object.keys(swipesData); // Get all user IDs that have been swiped on
        setSwipedUserIds(swipedUserIds); // Assume you have a state variable for this
      });
    } else {
      setSwipedUserIds([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const userRef = ref(database, 'users/' + user.uid); // Get the user data
      onValue(userRef, async (snapshot) => {
        const data = await snapshot.val();
        try {
          setLocation(data.location); // This will set the entire user data object
          setGender(data.gender);
          setUid(data.uid);
          setImg(data.url);
          // setSport(data.sport);
        } catch (error) {
          console.log("no loc here ", error);
        }
      });
    } else {
      setLocation('');
      setGender('');
      setUid('');
    }
  }, [user]);

  useEffect(() => {
    if (currentLocation !== "") {
      const fetchData = async () => {
        const dataRef = ref(database, 'users/');
        const snapshot = await get(dataRef);
        let profiles = [];
        snapshot.forEach((profile) => {
          // console.log(swipedUserIds)
          if (!swipedUserIds.includes(profile.key)) { // Check if the profile has not been swiped on
            const { name, url, uid, location, gender, exp, sport, weight, age } = profile.val();
            // console.log(profile.val().location, " vs ", currentLocation);
            if (query(profile.val().location, currentLocation) && query(profile.val().gender, currentGender) && !query(profile.val().uid, currentUid)) {
              // console.log("true for", name); // Debugging
              profiles.push({ name, url, uid, location, gender, exp, sport, weight, age });
            }
          }
        });
        // console.log(profiles); // Debugging
        setCharacters(profiles);
      };
      fetchData();
    }
  }, [currentUid, currentLocation]);

  const relate = (uid, currentUid, type, status) => {
    update(ref(database, `challenges/${currentUid}/${type}`), {
      [uid]: status,
    });
  };

  const swiped = (direction, uid) => {
    if (direction === "right") {
      // console.log("like: " + uid);
      relate(uid, currentUid, 'liked', true);
      relate(currentUid, uid, 'likedBack', true);
      // Store the swipe in the database
      const swipeRef = ref(database, `swipes/${currentUid}/`);
      update(swipeRef, { [uid]: direction }); // 'right' for like, 'left' for pass
      //Check if that user already liked bac to display match screen
      const likedBackRef = ref(database, `challenges/${currentUid}/likedBack`);
      onValue(likedBackRef, (snapshot) => {
        const likedBackData = snapshot.val() || {};
        if (likedBackData[uid] === true) {
          const userRef = ref(database, 'users/' + uid); // Get the user data
          onValue(userRef, async (snapshot) => {
            const data = await snapshot.val();
            try {
              setMatchedImg(data.url);
              setMatchedName(data.name);
              setMatchedUid(data.uid);
            } catch (error) {
              alert("error fetching profile image " + error);
            }
          })
          setModalVisible(true);
        }
      });
    } else {
      // console.log("pass: " + uid);
      relate(uid, currentUid, 'liked', false);
      relate(currentUid, uid, 'likedBack', false);
      const swipeRef = ref(database, `swipes/${currentUid}/`);
      update(swipeRef, { [uid]: direction });
    }
  };

  const outOfFrame = (name) => {
    // console.log(name + " left the screen!");
    setCharacters((prevCharacters) => prevCharacters.filter((character) => character.name !== name));
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
    <SafeAreaView>
      {user ? (
        <View className="flex items-center justify-center w-full">
          <Text style={{ fontFamily: 'BebasNeue' }} className="font-bold text-white text-5xl mt-6 mb-6">🥊 Sparrer 🥊</Text>
          <Modal
          className="h-full"
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
            <View className="flex-1 justify-center items-center mt-6 h-full">
              <ImageBackground
                source={ring}
                className="w-full h-full ">
                <View className=" h-full w-full rounded-2xl p-9 items-center shadow-lg shadow-black/25">
                  
                  <Text style= {{fontFamily: 'BebasNeue'}} className="mb-4 text-center text-white text-3xl">😈 New opp found!!! 😈</Text>
                  <View className="flex flex-row items-center p-3">
                  <Image
                    source={{ uri: matchedImg }}
                    style={{ width: width * 0.2, height: width * 0.2, borderRadius: (width * 0.2) / 2 }}
                  />
                  <Image
                    source={{ uri: glove }}
                    style={{ width: width * 0.2, height: width * 0.2, marginHorizontal: width * 0.05 }}
                  />
                  <Image
                    source={{ uri: currentImg }}
                    style={{ width: width * 0.2, height: width * 0.2, borderRadius: (width * 0.2) / 2 }}
                  />
                  </View>
                  <TouchableOpacity
                    style={{width: width * 0.8}}
                    className="rounded-2xl p-4 shadow-md bg-[#ff0000] my-6"
                    onPress={() => {
                      console.log("Navigate to chat screen for user with ID: ", matchedName);
                      navigation.navigate('(screens)', { screen: 'chat', params: {name: matchedName, uid: matchedUid, url: matchedImg, userUid: currentUid } });
                      setModalVisible(!modalVisible)
                    }}>
                    <Text style= {{fontFamily: 'BebasNeue'}} className="text-black text-center text-xl">🔥🔥Gloves on !!!🥊👊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{width: width * 0.8}}
                    className="rounded-2xl p-4 shadow-md bg-[#226cff]"
                    onPress={() => setModalVisible(!modalVisible)}>
                    <Text style= {{fontFamily: 'BebasNeue'}} className="text-black text-center text-xl">Keep looking... 🔍</Text>
                  </TouchableOpacity>
                  
                </View>
              </ImageBackground>
            </View>
          </Modal>
          <View className="w-[90%] mr-10 max-w-[260px] h-auto p-0">
            {characters?.length ? (
              characters.map((character) => (
                <TinderCard
                  swipeThreshold={1}
                  preventSwipe={["up", "down"]}
                  key={character.uid}
                  onSwipe={(dir) => swiped(dir, character.uid)}
                  onCardLeftScreen={() => outOfFrame(character.name)}
                >
                  <View className="absolute bg-white w-[300px] h-[500px] shadow-lg shadow-black/20 rounded-[20px] pb-[100px]">
                    <ImageBackground className="w-full h-full overflow-hidden rounded-[20px]" source={{ uri: character.url }}>
                      {/* ImageBackground now only covers part of the card */}
                    </ImageBackground>
                    <View className="absolute bottom-0 left-0 right-0 p-2.5">
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-black text-xl" selectable={false}>{character.name}, {character.age}</Text>
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-black text-base" selectable={false}>{character.location[0]}</Text>
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-black text-base" selectable={false}>{character.sport}, {character.weight}</Text>
                    </View>
                  </View>
                </TinderCard>
              ))
            ) : (
              <View className="flex justify-center items-center h-screen ml-8 pl-1 pb-20">
                <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-2xl ml-15 ">That's it for now 🙃</Text>
                <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-xl ">Let's get back to work! 💪🔥</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View className="flex items-center justify-center w-full ">
          <Text style={{ fontFamily: 'BebasNeue' }} className="font-bold text-white text-5xl mt-6">🥊 Sparrer 🥊</Text>
          <View className="flex justify-center items-center h-screen ">
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-2xl ">Please sign in to continue</Text>
            </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default Simple;