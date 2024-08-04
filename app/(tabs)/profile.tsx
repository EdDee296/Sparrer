import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';
import UploadImage from '@/components/Upload';

const UserProfileTab = () => {
  const [user, setUser] = useState<any>(null);
  const [photoURL, setPhotoURL] = useState('');
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser({
          displayName: authUser.displayName,
          email: authUser.email,
        });
        if (authUser.photoURL) {
          setPhotoURL(authUser.photoURL);
        }
      } else {
        setUser(null);
        setPhotoURL('');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setPhotoURL('');
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

  return (
    <View className="flex-1 items-center justify-center bg-[#221111]">
      {user ? (
        <>
          <UploadImage />
          <Text className="text-lg mb-2 text-[#ffffff]">Welcome, {user.displayName}</Text>
          <Text className="text-lg mb-2 text-[#ffffff]">Email: {user.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      ) : (
        <Button title="Please Sign in" onPress={() => navigation.navigate('(auth)', { screen: 'sign-in' })} />
      )}
    </View>
  );
};

export default UserProfileTab;