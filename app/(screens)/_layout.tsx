
import { Stack } from 'expo-router';
import 'react-native-reanimated';


const _layout = () => {
  return (
      <Stack>
        <Stack.Screen name="chat" options={{ headerShown: false }}  />
      </Stack>
  )
}

export default _layout