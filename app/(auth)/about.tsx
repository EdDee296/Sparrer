import { View, Text, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getDatabase, onValue, ref } from 'firebase/database';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';



const about = () => {
  const [user, setUser] = useState(null);
  const [tooltip, setTooltip] = useState(false);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const database = getDatabase();
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, async (snapshot) => {
          const data = await snapshot.val();
          if (!data.tooltipShown) {
            setTooltip(false);
          }
          else {
            setTooltip(true);
          }
        });
      }
    });
  
    return () => unsubscribe();
  }, [auth]);
  return (
    <SafeAreaView className="flex-1 bg-[#221111] items-center justify-start">
        {user ? (
          tooltip ? (<View>
            <Text className='text-white'>please do change in settings</Text>
          </View>) : (
            <View>
              <Text className='text-white'>about</Text>
            </View>
          )
        ) : (
          <View>
            <Text className='text-white'>please sign in</Text>
          </View>
        )}
    </SafeAreaView>
  )
}

export default about