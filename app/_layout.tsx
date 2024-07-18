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
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  if (loaded) {
         SplashScreen.hideAsync();
}
  if (!loaded) {
    return null;
  }
  return (
    <ThemeProvider value={{
      dark: false,
      colors: {
        primary: 'black',
        background: 'black',
        card: 'black',
        text: 'black',
        border: 'black',
        notification: 'black'
      }
    }}>
      <Stack
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}  />
        <Stack.Screen name="index" options={{ headerShown: false }}  />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>

  );
}
