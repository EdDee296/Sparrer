// Import necessary modules
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import UploadImage from '@/components/Upload';


const UserProfileTab = () => {
  // State to hold user data
  const [user, setUser] = useState<any>(null);
  const [photoURL, setPhotoURL] = useState(''); // Added state for photo URL
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is signed in, update the user state
        setUser({
          displayName: authUser.displayName,
          email: authUser.email,
        });
        if (authUser.photoURL) {
          setPhotoURL(authUser.photoURL);
        }
      } else {
        // User is signed out, reset the user state
        setUser(null);
      }
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, currentUser]);

  const handleSignOut = () => {
      signOut(auth).then(() => {
        // Sign-out successful.
        setUser(null);
        navigation.navigate('(auth)', { screen: 'sign-in' });
      }
    ).catch((error) => {
      console.log(error);
    });
  };

  // function handleChangePhoto(e) {
  //   if (e.target.files[0]) {
  //     setPhotoBinary(e.target.files[0]);
  //     upload(e.target.files[0], currentUser, setLoading);
  //   }
  // }
  // const fileInputRef = useRef<HTMLInputElement>(null);
  
  // const triggerFileInput = () => {
  //   fileInputRef.current?.click();
  // };
  return (
    <View className="flex-1 items-center justify-center bg-[#000000]">
      {/* <input type="file" ref={fileInputRef} onChange={handleChangePhoto} style={{ display: 'none' }} /> */}
      {user ? (
        <>
          {/* <View>
            <TouchableOpacity onPress={triggerFileInput} >
              <Image source={photoURL} className="w-10 h-10 bottom-5 rounded-full border-4 border-[#fefefe]" />
            </TouchableOpacity> 
          </View> */}
          <UploadImage/>
          <Text className="text-lg mb-2 text-[#ffffff]">Welcome, {user.displayName}</Text>
          <Text className="text-lg mb-2 text-[#ffffff]">Email: {user.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      ) : (
        // Corrected onPress for "Please Sign in" button
        //@ts-ignore
        <Button title="Please Sign in" onPress={() => navigation.navigate('(auth)', { screen: 'sign-in' })} />
      )}
    </View>
  );
};

export default UserProfileTab;