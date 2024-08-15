import { View, Text, ActivityIndicator, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

SplashScreen.preventAutoHideAsync();

const reset = () => {
  const [loaded, error] = useFonts({
    'BebasNeue': require('@/assets/fonts/BebasNeue-Regular.ttf'),
  });
  const [email, setEmail] = useState('');

  const navigation = useNavigation();

  const resetPassword = () => {
    const auth = getAuth();
    if (email) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert('Password reset email sent \nPlease check your email (Even spam)');
          navigation.navigate('(auth)', { screen: 'sign-in' });
        })
        .catch((error) => {
          const errorMessage = error.message;
          alert(errorMessage);
        });
    }
  };
	useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#221111', alignItems: 'center', justifyContent: 'start' }}>
			<ScrollView style={{ width: '100%', height: '100%' }}>
			<Text style={{ fontFamily: 'BebasNeue', color: '#ffffff', fontSize: 35, fontWeight: 'bold', textAlign: 'center', paddingTop: 20, paddingBottom: 12 }}>Reset your password</Text>
			<View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 12 }}>
				<Text style={{ fontFamily: 'BebasNeue', color: '#ffffff', fontSize: 18, fontWeight: 'medium', paddingBottom: 8 }}>Your email address</Text>
				<TextInput
				placeholder="Email"
				placeholderTextColor="#ffffff"
				style={{ width: '100%', height: 56, backgroundColor: '#000000', borderColor: '#7c7c7c', borderWidth: 1, borderRadius: 16, color: '#ffffff', padding: 16 }}
				value={email}
				onChangeText={setEmail}
			/>
			</View>
			<View style={{ justifyContent: 'center', alignItems: 'center' }}>
				<TouchableOpacity onPress={resetPassword} style={{ width: '50%', backgroundColor: '#ff2929', borderRadius: 16, padding: 16, marginHorizontal: 16, marginVertical: 16 }}>
				<Text style={{ fontFamily: 'BebasNeue', color: '#ffffff', textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>Send password reset link</Text>
				</TouchableOpacity>
			</View>
			</ScrollView>
		</SafeAreaView>
	)
}

export default reset