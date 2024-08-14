import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { get, getDatabase, onValue, ref } from 'firebase/database';
import _ from 'lodash';
import LatestMsg from '@/components/LatestMsg';

SplashScreen.preventAutoHideAsync();

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
  const [loaded, error] = useFonts({
    'BebasNeue': require('@/assets/fonts/BebasNeue-Regular.ttf'),
  });
  
  const [matches, setMatches] = useState([]);
  const [demoProfiles, setDemoProfiles] = useState([]);
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(true);
  const database = getDatabase(getApp());
  const auth = getAuth();
  const isFirstLoad = useRef(true);
  const navigation = useNavigation();
  const user = auth.currentUser;

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
          const newMatches = users.filter(user => !matches.some(match => match.uid === user.uid ));
          if (newMatches.length > 0) {
            setMatches(prevMatches => [...prevMatches, ...newMatches]);
            const updatedDemoProfiles = newMatches.map((match) => {
              const { uid, name, url } = match;
              return { id: uid, first_name: name, image_url: url };
            });
            setDemoProfiles(prevDemoProfiles => [...prevDemoProfiles, ...updatedDemoProfiles]);
          }
          setLoading(false); // Data fetching is complete
        });
      }, (error) => {
        console.error(error);
        setLoading(false); // Data fetching is complete even if there's an error
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

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const renderRow = (data) => {
    const first_name = data.item.first_name;
    const url = data.item.image_url;
    return (
      <TouchableOpacity
      onPress={() => {
        console.log("Navigate to chat screen for user with ID: ", data.item.first_name);
        navigation.navigate('(screens)', { screen: 'chat', params: {name: data.item.first_name, uid: data.item.id, url: data.item.image_url, userUid: uid } });
      }}
      >
        <View className="flex flex-row items-center p-3">
          <Image
            source={{ uri: url }}
            className="w-16 h-16 rounded-full"
          />
          <View>
            <Text style={{ fontFamily: 'BebasNeue' }} className="text-white text-lg ml-3 mb-1">
              {first_name}
            </Text>
            <LatestMsg userUid={uid} uid={data.item.id} font='BebasNeue'/>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView className='flex flex-1'>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'BebasNeue' }} className="font-bold text-white text-3xl mt-6">Your matched opponents</Text>
      </View>
      {user ? (
        loading ? (
          <View className="flex flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="red" />
          </View>
        ) : (
          demoProfiles?.length ? (
            <FlatList
              data={demoProfiles}
              renderItem={renderRow}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 10,
              }}
            />
          ) : (
            <View className="flex flex-1 justify-center items-center">
              <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-2xl">No match yet</Text>
            </View>
          )
        )
      ) : (
        <View className="flex flex-1 justify-center items-center">
          <Text style={{ fontFamily: 'BebasNeue' }} className="text-[#ffffff] text-2xl">Please sign in to continue</Text>
        </View>
      )}
    </SafeAreaView>
  );
}