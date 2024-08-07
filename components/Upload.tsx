import React, { useState, useEffect } from 'react';
import { Image, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile } from 'firebase/auth';
import { getDatabase, ref as databaseRef, set } from "firebase/database";
import { upload } from '@/FireBaseConfig';

export default function UploadImage() {
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser?.photoURL) {
          setImage(authUser.photoURL);
        }
      if (authUser) {
      const uid = authUser.uid;
      }
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const addImage = async () => {
    let _image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!_image.canceled) {
      setImage(_image.assets[0].uri);
      const blob = await fetch(_image.assets[0].uri).then(r => r.blob()); // Convert the image URI to a blob
      const url = await upload(blob, user, setLoading).catch(error => {
        console.error("Error uploading image:", error);
        Alert.alert("Upload failed", "There was an issue uploading your image.");
      });
      if (url) {
        updateProfile(user, { photoURL: url });
        const db = getDatabase();
        set(databaseRef(db, 'users/' + user.uid), {
          name: user.displayName,
          email: user.email,
          uid: user.uid,
          url: url,
        });
      }
    }
  };

  return (
    <View style={imageUploaderStyles.container}>
      
      <View style={imageUploaderStyles.uploadBtnContainer}>
        <TouchableOpacity onPress={addImage} style={imageUploaderStyles.uploadBtn} disabled={loading}>
        {image && <Image source={{ uri: image }} style={{ width: 150, height: 150 }} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Your existing styles here
const imageUploaderStyles=StyleSheet.create({
    container:{
        elevation:2,
        height:150,
        width:150,
        backgroundColor:'#efefef',
        position:'relative',
        borderRadius:999,
        overflow:'hidden',
    },
    uploadBtnContainer:{
        position:'absolute',
        right:0,
        bottom:0,
        backgroundColor:'lightgrey',
        width:'100%',
        height:'100%',
    },
    uploadBtn:{
        display:'flex',
        alignItems:"center",
        justifyContent:'center'
    }
})