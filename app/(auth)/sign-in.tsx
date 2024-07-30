import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [spinnings, setSpinnings] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, navigate to the main screen
        navigation.navigate('(tabs)', { screen: 'index' });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const handleSignIn = async () => {
    setSpinnings(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setSpinnings(false);
        const user = userCredential.user;
        console.log(user);
        setUser(user);
      })
      .catch((error) => {
        setSpinnings(false);
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#221111', alignItems: 'center', justifyContent: 'start' }}>
      {spinnings ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <ScrollView style={{ width: '100%', height: '100%' }}>
          <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', paddingTop: 20, paddingBottom: 12 }}>Sign in and box!</Text>
          <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'medium', paddingBottom: 8 }}>Email</Text>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#ffffff"
              style={{ width: '100%', height: 56, backgroundColor: '#000000', borderColor: '#7c7c7c', borderWidth: 1, borderRadius: 16, color: '#ffffff', padding: 16 }}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'medium', paddingBottom: 8 }}>Password</Text>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#ffffff"
              secureTextEntry
              style={{ width: '100%', height: 56, backgroundColor: '#000000', borderColor: '#7c7c7c', borderWidth: 1, borderRadius: 16, color: '#ffffff', padding: 16 }}
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleSignIn} style={{ width: '50%', backgroundColor: '#ff2929', borderRadius: 16, padding: 16, marginHorizontal: 16, marginVertical: 16 }}>
              <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: 'bold' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Link href={'/sign-up'} style={{ color: '#838383', fontSize: 14, paddingHorizontal: 16, paddingBottom: 12 }}>Haven't had an account? Sign up now!</Link>
            <Link href={'/'} style={{ color: '#838383', fontSize: 14, paddingHorizontal: 16, paddingBottom: 12 }}>Forgot your password?</Link>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SignIn;