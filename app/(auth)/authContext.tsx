import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [spinnings, setSpinnings] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // console.log('User is signed in');
        // Reset the navigation state
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: '(tabs)', params: { screen: 'index' } },
            ],
          })
        );
      } else {
        setSpinnings(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {spinnings ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="red" />
          </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};