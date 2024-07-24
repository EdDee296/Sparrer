import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { get, getDatabase, onValue, ref } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, Platform, View, Text, ScrollView, FlatList, Alert, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const getUser = async (uid) => {
  const database = getDatabase(getApp());
  const snapshot = await get(ref(database, `users/${uid}`));
  return snapshot.val();
}

const getOverlap = (liked, likedBack) => {
  const likedTrue = _.pickBy(liked, (value) => value );
  const likedBackTrue = _.pickBy(likedBack, (value) => value );
  return _.intersection(_.keys(likedTrue), _.keys(likedBackTrue));
}

export default function TabTwoScreen() {
  const [matches, setMatches] = useState([]);
  const [demoProfiles, setDemoProfiles] = useState([]);
  const database = getDatabase(getApp());
  const [uid, setUid] = useState('');
  const auth = getAuth();
  const isFirstLoad = useRef(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      }
    });
    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, [auth]);

  useEffect(() => {
    if (uid) {
      const matchesRef = ref(database, `challenges/${uid}`);
      const unsubscribe = onValue(matchesRef, (snapshot) => {
        const { liked, likedBack } = snapshot.val() || { liked: {}, likedBack: {} };
        const allMatches = getOverlap(liked, likedBack);
        const promises = allMatches.map((uid) => {
          const foundProfile = _.find(matches, profile => profile.uid === uid);
          if (foundProfile) {
            return Promise.resolve(foundProfile);
          } else {
            return getUser(uid);
          }
        });
        Promise.all(promises).then((users) => {
          const newMatches = users.filter(user => !matches.some(match => match.uid === user.uid));
          if (newMatches.length > 0) {
            setMatches(prevMatches => [...prevMatches, ...newMatches]);
            if (!isFirstLoad.current) { // Only show alert if it's not the first load
              alert("New Match Found!");
            }
            const updatedDemoProfiles = newMatches.map((match) => {
              const { uid, name, url } = match;
              return { id: uid, first_name: name, image_url: url };
            });
            setDemoProfiles(prevDemoProfiles => [...prevDemoProfiles, ...updatedDemoProfiles]);
          }
        });
      }, (error) => {
        console.error(error);
      });

      return () => unsubscribe();
    }
  }, [uid, database, matches]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false; // After the first effect runs, mark it as not the first load
    }
  }, []); // This effect only runs once on mount

  useEffect(() => {
    // Reset demoProfiles when the component mounts or when the user navigates back
    setDemoProfiles([]);
  }, []);

  const renderRow = (data) => {
    const first_name = data.item.first_name;
    const url = data.item.image_url;
    return (
      <TouchableOpacity
      onPress={() => {
        console.log("Navigate to chat screen for user with ID: ", data.item.first_name);
      }}
      >
        <View style={styles.container}>
          {/* Use the tw function to apply TailwindCSS styles */}
          <Image
            source={{ uri: url }}
            style={styles.image}
          />
          <Text style={styles.text}>
            {first_name}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={demoProfiles}
          renderItem={renderRow}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 10,
          }}
        >
        </FlatList>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Aligns children in a row
    alignItems: 'center', // Centers children vertically in the container
    borderColor: 'gray', // Sets the border color to gray
    borderWidth: 1, // Sets the border width
    borderRadius: 10, // Optional: Adds rounded corners to the container
    padding: 10, // Optional: Adds some padding inside the container for better spacing
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25, // Adjusted for a more appropriate circle shape given the size
  },
  text: {
    color: 'white', // Assuming you want white text
    fontSize: 24, // Adjusted for better visual balance with the image size
    marginLeft: 10, // Adds some space between the image and the text
  },
});