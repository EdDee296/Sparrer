
import { Stack } from 'expo-router';
import 'react-native-reanimated';


const _layout = () => {
  return (
      <Stack>
        <Stack.Screen name="sign-in" options={{ headerShown: false }}  />
        <Stack.Screen name="sign-up" options={{ headerShown: false }}  />
      </Stack>
  )
}

export default _layout