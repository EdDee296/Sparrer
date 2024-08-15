// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, GeoPoint, addDoc, doc, collection, setDoc } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Have to do ts-ignore as getReactNativePersistence is not detected by ts compiler with firebase 10.3.0
// @ts-ignore 
import { initializeAuth, updateProfile } from 'firebase/auth';
import { getDownloadURL, getStorage, ref as ref_storage, uploadBytes } from "firebase/storage";
//@ts-ignore
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import AsyncStorage from "@react-native-async-storage/async-storage"


const firebaseConfig = {
  apiKey: "AIzaSyAJ9Fs8SKz3AQkscId_VuoZ0XG2g59ISyU",
  authDomain: "chag-75cfe.firebaseapp.com",
  databaseURL: "https://chag-75cfe-default-rtdb.firebaseio.com",
  projectId: "chag-75cfe",
  storageBucket: "chag-75cfe.appspot.com",
  messagingSenderId: "801968476236",
  appId: "1:801968476236:web:731d1a01fef99dc913e4e9",
  measurementId: "G-BS7E11ECQW"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const ftdb = getFirestore(app);
const storage = getStorage();
// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});


export { app, ftdb, auth };

export async function upload(file, currentUser, setLoading) {
  const fileRef = ref_storage(storage, 'images/' + currentUser.uid + ".jpeg");

  setLoading(true);
  try {
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await updateProfile(currentUser, {photoURL: url});
    return url;
  } catch (error) {
    console.error("Upload failed", error);
    alert("Upload failed");
  } finally {
    setLoading(false);
    
  }
};



