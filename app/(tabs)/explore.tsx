import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { get, getDatabase, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { StyleSheet, Image, Platform, View, Text, ScrollView, FlatList } from 'react-native';
import _ from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';

const demoProfiles = [
  {
    id: '259389830744794',
    first_name: 'Candice',
    image_url: 'https://www.instagram.com/p/CeWZqQsMOBx'
  },
  {
    id: '720115413',
    first_name: 'Alessandra',
    image_url: 'https://www.instagram.com/p/CPdY-ujN5T7'
  },
  {
    id: '912478262117011',
    first_name: 'Rosie',
    image_url: 'https://www.instagram.com/p/CZZKSO1v4M2'
  },
]

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
  const database = getDatabase(getApp());
  const [uid, setUid] = useState('');
  const auth = getAuth();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      }
    });
    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, [auth]);

  useEffect(() => {
    if (uid) { // Ensure uid is not empty
      const matchesRef = ref(database, `challenges/${uid}`);
      const unsubscribe = onValue(matchesRef, (snapshot) => {
        const { liked, likedBack } = snapshot.val() || { liked: {}, likedBack: {} }; // Handle null snapshot
        const allMatches = getOverlap(liked, likedBack);
        console.log(allMatches);
        const promises = allMatches.map((uid) => {
          const foundProfile = _.find(matches, profile => profile.uid === uid);
          return foundProfile ? Promise.resolve(foundProfile) : getUser(uid); // Return existing or fetch new
        });
        Promise.all(promises).then((users) => {
          console.log('matched users: ', users);
          const newMatches = users.filter(user => !matches.some(match => match.uid === user.uid)); // Filter out duplicates
          if (newMatches.length > 0) {
            setMatches(prevMatches => [...prevMatches, ...newMatches]); // Only update if there are new matches
            console.log('new matches: ', newMatches);
            newMatches.forEach((match) => {
              const { uid, name, url } = match;
              demoProfiles.push({ id: uid, first_name: name, image_url: url });
            });
          }
        });
      }, (error) => {
        console.error(error);
      });
  
      return () => unsubscribe(); // Cleanup on component unmount or uid change
    }
  }, [uid, database, matches]); // Add matches to dependency array if necessary, but be cautious of infinite loops


  const renderRow = (data) => {
    const first_name = data.item.first_name;
    const url = data.item.image_url;
    return (
      <View style={styles.container}>
          {/* Use the tw function to apply TailwindCSS styles */}
          <Image
            source={{ uri: 'https://graph.facebook.com/259389830744794/picture?height=500' }}
            style={styles.image}
          />
          <Text style={styles.text}>
            {first_name}
          </Text>
        </View>
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