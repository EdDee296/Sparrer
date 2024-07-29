import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [spinnings, setSpinnings] = useState(false);
  const auth = getAuth();
  const navigation = useNavigation();
  const handleSignIn = async () => {
    setSpinnings(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        setSpinnings(false);
        const user = userCredential.user;
        // ...
        console.log(user);
        // alert('User signed in successfully!');
        // @ts-ignore
        navigation.navigate('(tabs)', { screen: 'index' });
        
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-start">
      {spinnings ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : 
      <ScrollView className="w-full h-full">
        <Text className="text-[#ffffff] text-2xl font-bold text-center pt-5 pb-3">Sign in and box!</Text>
        <View className="w-full px-4 py-3">
        <Text className="text-[#ffffff] text-lg font-medium pb-2">Email</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="[#ffffff]"
            className="w-full h-14 bg-[#000000] border border-[#7c7c7c] rounded-xl text-[#ffffff] p-4"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View className="w-full px-4 py-3">
        <Text className="text-[#ffffff] text-lg font-medium pb-2">Password</Text>
          <TextInput
            placeholder="Password"
            placeholderTextColor="[#ffffff]"
            secureTextEntry
            className="w-full h-14 bg-[#000000] border border-[#7c7c7c] rounded-xl text-[#ffffff] p-4"
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View className="flex justify-center items-center ">
          <TouchableOpacity onPress={handleSignIn} className="w-1/2 bg-[#ff2929] rounded-xl p-4 mx-4 my-4">
            <Text className="text-[#ffffff] text-center font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
        <View className="flex justify-center items-center ">
          <Link href={'/sign-up'} className="text-[#838383] text-sm px-4 pb-3">Haven't had an account? Sign up now!</Link>
          <Link href={'/'} className="text-[#838383] text-sm px-4 pb-3">Forgot your password?</Link>
        </View>
      </ScrollView>}
    </SafeAreaView>
  );
};

export default SignIn;