import React, { useEffect, useState } from "react";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TinderCard from "react-tinder-card";
import { getDatabase, onValue, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getApp } from "firebase/app";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

const database = getDatabase(getApp());

const query = (data, currentData) => {
  if (JSON.stringify(data) === JSON.stringify(currentData)) {
    return true;
  } else {
    return false;
  }
};

function Simple() {
  const [loaded, error] = useFonts({
    'BebasNeue': require('@/assets/fonts/BebasNeue-Regular.ttf'),
  });

  const [currentLocation, setLocation] = useState('');
  const [currentGender, setGender] = useState('');
  const [currentUid, setUid] = useState('');
  // const [currentSport, setSport] = useState('');
  const [swipedUserIds, setSwipedUserIds] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [characters, setCharacters] = useState([]); // Use this state to hold your fetched data
  const auth = getAuth();
  const user = auth.currentUser;

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
  }, [currentUid]);

  useEffect(() => {
    if (user) {
      const userRef = ref(database, 'users/' + user.uid); // Adjusted to point to the user's root node
      onValue(userRef, async (snapshot) => {
        const data = await snapshot.val();
        try {
          setLocation(data.location); // This will set the entire user data object
          setGender(data.gender);
          setUid(data.uid);
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
  }, [currentUid]);

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
    } else {
      console.log("No location yet, still updating");
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
      setLastDirection(direction);
      relate(uid, currentUid, 'liked', true);
      relate(currentUid, uid, 'likedBack', true);
      // Store the swipe in the database
      const swipeRef = ref(database, `swipes/${currentUid}/`);
      update(swipeRef, { [uid]: direction }); // 'right' for like, 'left' for pass
    } else {
      // console.log("pass: " + uid);
      setLastDirection(direction);
      relate(uid, currentUid, 'liked', false);
      relate(currentUid, uid, 'likedBack', false);
      const swipeRef = ref(database, `swipes/${currentUid}/`);
      update(swipeRef, { [uid]: direction });
    }
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
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
          <Text style={{ fontFamily: 'BebasNeue' }} className="font-bold text-white text-5xl mt-6">Sparrer</Text>
          {/* <UpdateLocation uid={uid} /> */}
          <View className="w-[90%] max-w-[260px] h-auto p-0">
            {characters?.length ? (
              characters.map((character) => (
                <TinderCard
                  swipeThreshold={0.5}
                  preventSwipe={["up", "down"]}
                  key={character.uid}
                  onSwipe={(dir) => swiped(dir, character.uid)}
                  onCardLeftScreen={() => outOfFrame(character.name)}
                >
                  <View className="absolute bg-white w-full max-w-[260px] h-[400px] shadow-lg shadow-black/20 rounded-[20px] pb-[100px]">
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
              <View className="flex justify-center items-center h-screen ">
                <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-2xl ">That's it for now 🙃</Text>
                <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-xl ">Let's get back to work! 💪🔥</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View className="flex items-center justify-center w-full">
          <Text style={{ fontFamily: 'BebasNeue' }} className="font-bold text-white text-5xl mt-6">Sparrer</Text>
          <View className="flex justify-center items-center h-screen ">
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-2xl ">Please sign in to continue</Text>
            </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default Simple;