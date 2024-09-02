import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, Modal, Image, Text, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TinderCard from "react-tinder-card";
import { getDatabase, onValue, ref, get, update } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getApp } from "firebase/app";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useNavigation } from "@react-navigation/native";
import { Dimensions } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import uuid from 'react-native-uuid';
import * as geofire from 'geofire-common';
import { ftdb } from "@/FireBaseConfig";
import AntDesign from '@expo/vector-icons/AntDesign';
import { collection, query as Rquery, orderBy, startAt, endAt, getDocs, doc, getDoc } from 'firebase/firestore';

SplashScreen.preventAutoHideAsync();

const database = getDatabase(getApp());

const query = (data, currentData) => {
  return JSON.stringify(data) === JSON.stringify(currentData);
};

const geoquery = async (center, radiusInM) => {
  const bounds = geofire.geohashQueryBounds(center, radiusInM);
  const promises = [];
  for (const b of bounds) {
    const q = Rquery(
      collection(ftdb, 'radius'), 
      orderBy('geohash'), 
      startAt(b[0]), 
      endAt(b[1]));

    promises.push(getDocs(q));
  }

  const snapshots = await Promise.all(promises);

  const matchingDocs = [];
  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const lat = doc.get('lat');
      const lng = doc.get('lng');

      const distanceInKm = geofire.distanceBetween([lat, lng], center);
      const distanceInM = distanceInKm * 1000;
      if (distanceInM <= radiusInM) {
        matchingDocs.push({ uid: doc.get('uid'), distanceInKm });
      }
    }
  }
  return matchingDocs;
}

const ring = require('@/assets/images/ring.jpg');
const glove = require('@/assets/images/gloves.png');
const { width } = Dimensions.get('window');

function Simple()  {
  const [loaded, error] = useFonts({
    'BebasNeue': require('@/assets/fonts/BebasNeue-Regular.ttf'),
  });

  const [currentLocation, setLocation] = useState('');
  const [currentGender, setGender] = useState('');
  const [currentUid, setUid] = useState('');
  const [currentImg, setImg] = useState('');
  const [swipedUserIds, setSwipedUserIds] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [matchedImg, setMatchedImg] = useState('');
  const [matchedName, setMatchedName] = useState('');
  const [matchedUid, setMatchedUid] = useState('');
  const [modalInfo, setModalInfo] = useState(false);
  const [user, setUser] = useState(null);
  const [swipedCard, setSwipedCard] = useState(null);
  const [radius, setRadius] = useState(0);
  const [pointerEvent, setPointerEvent] = useState("none");
  const [data, setData] = useState([]);

  const auth = getAuth();
  const navigation = useNavigation();

  const fetchData = async (user, radiusInM) => {
    if (user) {
      const docRef = doc(ftdb, "radius", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const match = await geoquery([data.lat, data.lng], radiusInM);
        return match;
      }
    }
    return [];
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user.metadata.creationTime === user.metadata.lastSignInTime) {
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, async (snapshot) => {
          const data = await snapshot.val();
          if (data && !data.tooltipShown) {
            setModalOpen(true);
          }
        });
      }
    });
  
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      const swipesRef = ref(database, `swipes/${user.uid}`);
      onValue(swipesRef, async (snapshot) => {
        const swipesData = await snapshot.val() || {};
        const swipedUserIds = Object.keys(swipesData);
        setSwipedUserIds(swipedUserIds);
      });
    } else {
      setSwipedUserIds([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const userRef = ref(database, 'users/' + user.uid);
      onValue(userRef, async (snapshot) => {
        const data = await snapshot.val();
        try {
          setLocation(data.location);
          setGender(data.gender);
          setUid(data.uid);
          setImg(data.url);
          setRadius(data.radius * 1000);
        } catch (error) {
           console.log("there is an error when updating data", error);
        }
      });
    } else {
      setLocation('');
      setGender('');
      setUid('');
    }
  }, [user]);

  useEffect(() => {
    if (user && radius > 0) {
      fetchData(user, radius).then((data) => {
        // console.log("All user in the range of ", radius/1000, " km");
        // console.log("data: ", data);
        setData(data);
      });
    }
  }, [user, radius]);

  useEffect(() => {
    if (currentLocation !== "") {
      const fetchData = async () => {
        const dataRef = ref(database, 'users/');
        const snapshot = await get(dataRef);
        let profiles = [];
        snapshot.forEach((profile) => {
          if (!swipedUserIds.includes(profile.key)) {
            const { name, url, uid, location, gender, exp, sport, weight, age, about } = profile.val();
            const distanceData = data.find(item => item.uid === profile.val().uid);
            if (query(profile.val().gender, currentGender) && !query(profile.val().uid, currentUid) && distanceData) {
              profiles.push({ name, url, uid, location, gender, exp, sport, weight, age, distance: distanceData.distanceInKm, about});
            }
          }
        });
        setCharacters(profiles);
      };
      fetchData();
    }
  }, [data, currentUid, currentLocation]);

  const relate = (uid, currentUid, type, status) => {
    update(ref(database, `challenges/${currentUid}/${type}`), {
      [uid]: status,
    });
  };

  const swiped = (direction, uid) => {
    setSwipedCard(uid);
    if (direction === "right") {
      relate(uid, currentUid, 'liked', true);
      relate(currentUid, uid, 'likedBack', true);
      const swipeRef = ref(database, `swipes/${currentUid}/`);
      update(swipeRef, { [uid]: direction });
      const likedBackRef = ref(database, `challenges/${currentUid}/likedBack`);
      onValue(likedBackRef, (snapshot) => {
        const likedBackData = snapshot.val() || {};
        if (likedBackData[uid] === true) {
          const userRef = ref(database, 'users/' + uid);
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
      relate(uid, currentUid, 'liked', false);
      relate(currentUid, uid, 'likedBack', false);
      const swipeRef = ref(database, `swipes/${currentUid}/`);
      update(swipeRef, { [uid]: direction });
    }
  };

  const outOfFrame = (name) => {
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
        currentLocation ? (
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
                    <Text style={{ fontFamily: 'BebasNeue' }} className="mb-4 text-center text-white text-3xl">😈 New opp found!!! 😈</Text>
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
                      style={{ width: width * 0.8 }}
                      className="rounded-2xl p-4 shadow-md bg-[#ff0000] my-6"
                      onPress={() => {
                        console.log("Navigate to chat screen for user with ID: ", matchedName);
                        navigation.navigate('(screens)', { screen: 'chat', params: { name: matchedName, uid: matchedUid, url: matchedImg, userUid: currentUid } });
                        setModalVisible(!modalVisible)
                      }}>
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-black text-center text-xl">🔥🔥Gloves on !!!🥊👊</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ width: width * 0.8 }}
                      className="rounded-2xl p-4 shadow-md bg-[#226cff]"
                      onPress={() => setModalVisible(!modalVisible)}>
                      <Text style={{ fontFamily: 'BebasNeue' }} className="text-black text-center text-xl">Keep looking... 🔍</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </View>
            </Modal>
            
            <View className="w-[90%] mr-10 max-w-[260px] h-auto p-0">
              {characters?.length ? (
                characters.filter(character => character.uid !== swipedCard).map((character) => (
                  <Tooltip
                    key={uuid.v4().toString()}
                    isVisible={modalOpen}
                    content={<Text>Swipe right to match ➡️</Text>}
                    placement="top"
                    allowChildInteraction={false}
                    horizontalAdjustment={100}
                    childrenWrapperStyle={{ transform: [{ rotate: '30deg' }] }}
                    onClose={() => {
                      setModalOpen(false)
                      setModalOpen2(true)
                    }}
                    contentStyle={{ width: '100%' }}
                  >
                    <Tooltip
                      key={uuid.v4().toString()}
                      isVisible={modalOpen2}
                      content={<Text>⬅️ Swipe left to pass</Text>}
                      placement="top"
                      allowChildInteraction={false}
                      horizontalAdjustment={-350}
                      childrenWrapperStyle={{ transform: [{ rotate: '-30deg' }], height: 300 }}
                      onClose={() => {
                        const userRef = ref(database, `users/${user.uid}`);
                        setModalOpen2(false); 
                        update(userRef, { tooltipShown: true });}}
                      contentStyle={{ width: '100%' }}
                    >
                      {!modalInfo ? (
                        <TinderCard
                        swipeThreshold={1}
                        preventSwipe={["up", "down"]}
                        key={character.uid}
                        onSwipe={(dir) => swiped(dir, character.uid)}
                        onCardLeftScreen={() => outOfFrame(character.name)}
                        >
                          <View className="absolute bg-white w-[300px] h-[500px] shadow-lg shadow-black/20 rounded-[20px] pb-[100px]" style={{ pointerEvents: modalInfo ? "none" : "auto" }}>
                            <ImageBackground className="w-full h-full overflow-hidden rounded-[20px]" source={{ uri: character.url }}>
                            </ImageBackground>
                            <View className="absolute bottom-0 left-0 right-0 p-2.5">
                              <Text style={{ fontFamily: 'BebasNeue' }} className="text-black text-xl" selectable={false}>{character.name}, {character.age}</Text>
                              <Text style={{ fontFamily: 'BebasNeue' }} className="text-black text-base" selectable={false}>{character.sport}, {character.weight}</Text>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'BebasNeue' }} className="text-black text-base" selectable={false}>
                                  {character.distance.toFixed(2)} km away from you!
                                </Text>
                                <TouchableOpacity onPress={() => { setModalInfo(true); setPointerEvent("none"); }}>
                                  <AntDesign name="upcircleo" size={24} color="black" />
                                  
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </TinderCard>
                      ) : ( 
                        <Modal
                          animationType='slide'
                          visible={modalInfo}
                          transparent={true}
                          className="h-full w-full"
                          onRequestClose={() => {
                            setModalInfo(false);
                            setPointerEvent("auto");
                          }}
                        >
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                            <TouchableWithoutFeedback onPress={() => { setModalInfo(false); setPointerEvent("auto"); }}>
                              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                            </TouchableWithoutFeedback>
                            <SafeAreaView className="flex-1 justify-center items-center mt-6 rounded-[20px]">
                              <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="w-[300px] bg-[#9d8f8f] justify-start items-center relative rounded-[20px] p-4">
                                  <TouchableOpacity
                                    style={{ position: 'absolute', top: 10, right: 10 }}
                                    onPress={() => { setModalInfo(false); setPointerEvent("auto"); }}
                                  >
                                    <Text style={{ fontSize: 18 }}>X</Text>
                                  </TouchableOpacity>
                                  <Text style={{ fontFamily: 'BebasNeue' }} className="font-bold text-[#4f2727] text-2xl mb-4">
                                    more info for {character.name}
                                  </Text>
                                  <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#000000] text-lg">
                                    About: {character.about}
                                  </Text>
                                </View>
                              </ScrollView>
                            </SafeAreaView>
                          </View>
                        </Modal>
                      )}
                    </Tooltip>
                  </Tooltip>
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
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-2xl py-7">Please fill in all your information to continue</Text>
              <TouchableOpacity
              className="rounded-2xl p-4 shadow-md bg-[#226cff]"
              onPress={() => navigation.navigate('(auth)', { screen: 'about' })}
            >
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-2xl ">continue</Text>
            </TouchableOpacity>
            </View>
            
          </View>
        )
      ) : (
        <View className="flex items-center justify-center w-full ">
          <Text style={{ fontFamily: 'BebasNeue' }} className="font-bold text-white text-5xl mt-6">🥊 Sparrer 🥊</Text>
          <View className="flex justify-center items-center h-screen ">
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-2xl ">Please sign in to continue</Text>
            <Button title="Sign in" onPress={() => navigation.navigate('(auth)', { screen: 'sign-in' })} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default Simple;