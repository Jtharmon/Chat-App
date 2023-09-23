import { StyleSheet, Text, View } from 'react-native';
//import screens
import Start from './components/Start';
import Chat from './components/Chat';
//import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  disableNetwork,
  enableNetwork,
} from 'firebase/firestore';
import { useNetInfo } from '@react-native-community/netinfo';
import { LogBox, Alert } from 'react-native';
import { useEffect } from 'react';
import { getStorage } from 'firebase/storage';

//create navigator
const Stack = createNativeStackNavigator();

export default function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyD7w2AaPzEtTxwaERq61wSL8VSk7qyI2SU",
    authDomain: "chat-app-85841.firebaseapp.com",
    projectId: "chat-app-85841",
    storageBucket: "chat-app-85841.appspot.com",
    messagingSenderId: "1013875354810",
    appId: "1:1013875354810:web:b79e07e37d82cf5d876683",
    measurementId: "G-35SWZL8GXK"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service (for the database)
  const db = getFirestore(app);

  //Initialize storage
  const storage = getStorage(app);

  //network connectivity status state setup
  const connectionStatus = useNetInfo();

  //monitors connection status and disables or enables based on that.
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert('Connection lost');
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {(props) => (
            <Chat
              isConnected={connectionStatus.isConnected}
              db={db}
              storage={storage}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});