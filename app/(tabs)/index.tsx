import React, { useEffect, useState } from "react";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TinderCard from "react-tinder-card";
import { getDatabase, onValue, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getApp } from "firebase/app";

const database = getDatabase(getApp());

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 30,
    marginBottom: 30,
  },
  cardContainer: {
    width: '90%',
    maxWidth: 260,
    height: 400,
    innerHeight: 'auto',
    padding: 0,
  },
  card: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 260,
    height: 400,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    borderRadius: 20,
    resizeMode: 'cover',
    paddingBottom: 100, // Reserve space for text below the image
  },
  cardImage: {
    width: '100%',
    height: '100%', // Adjust this value as needed
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  cardTitle: {
    color: 'black',
    fontSize: 20, // Adjust font size as needed
  },
  cardLocation: {
    color: 'black',
    fontSize: 16, // Adjust font size as needed
  },
  ct: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: 'black',
    zIndex: 1, // Ensure it's above other elements
  },
  infoText: {
    color: 'white',
    height: 28,
    justifyContent: 'center',
    display: 'flex',
    zIndex: -100,
  },
};

const query = (data, currentData) => {
  if (JSON.stringify(data) === JSON.stringify(currentData)) {
    return true;
  } else {
    return false;
  }
};

function Simple() {
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
  };

  return (
    <SafeAreaView>
      {user ? (<View style={styles.container}>
        <Text style={styles.header}>Sparrer</Text>
        {/* <UpdateLocation uid={uid} /> */}
        <View style={styles.cardContainer}>
          {characters?.length ? (
            characters.map((character) => (
              <TinderCard
                swipeThreshold={0.5}
                preventSwipe={["up", "down"]}
                key={character.uid}
                onSwipe={(dir) => swiped(dir, character.uid)}
                onCardLeftScreen={() => outOfFrame(character.name)}
              >
                <View style={styles.card}>
                  <ImageBackground style={styles.cardImage} source={{ uri: character.url }}>
                    {/* ImageBackground now only covers part of the card */}
                  </ImageBackground>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle} selectable={false}>{character.name}, {character.age}</Text>
                    <Text style={styles.cardLocation} selectable={false}>{character.location[0]}</Text>
                    <Text style={styles.cardLocation} selectable={false}>{character.sport}, {character.weight}</Text>
                  </View>
                </View>
              </TinderCard>
            ))
          ) : (
            <View className="flex justify-center items-center h-screen ">
              <Text className="text-[#ffffff] text-2xl ">That's it for now</Text>
              <Text className="text-[#ffffff] text-2xl ">Let's get back to work!</Text>
            </View>
          )}
        </View>
        {lastDirection ? (
          <Text style={styles.infoText}>You swiped {lastDirection}</Text>
        ) : (
          <Text style={styles.infoText} />
        )}
      </View>) : (
        <View style={styles.container}>
          <Text style={styles.header}>Sparrer</Text>
          <View className="flex justify-center items-center h-screen ">
              <Text className="text-[#ffffff] text-2xl ">Please sign in to continue</Text>
            </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default Simple;