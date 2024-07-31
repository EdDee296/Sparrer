import { ThemeProvider, useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { NativeWindStyleSheet } from 'nativewind';

NativeWindStyleSheet.setOutput({
  default: "native",
});
//Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={{
      dark: false,
      colors: {
        primary: '#221111',
        background: '#221111',
        card: '#221111',
        text: '#221111',
        border: '#221111',
        notification: '#221111'
      }
    }}>
      <Stack
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}  />
        <Stack.Screen name="(auth)" options={{ headerShown: false }}  />
        <Stack.Screen name="index" options={{ headerShown: false }}  />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>

  );
}
