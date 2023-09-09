import Start from "./components/Start";
import Chat from "./components/Chat";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp } from "firebase/app";
import { getFirestore, disableNetwork, enableNetwork } from "firebase/firestore";
import { useEffect } from "react";
import { LogBox, Alert } from "react-native";
import { getStorage } from "firebase/storage";

// init the Stack object for the two main views, Start and Chat. 
const Stack = createNativeStackNavigator();

// init firebase and connect to firestore and access storage
const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyD7w2AaPzEtTxwaERq61wSL8VSk7qyI2SU",
    authDomain: "chat-app-85841.firebaseapp.com",
    projectId: "chat-app-85841",
    storageBucket: "chat-app-85841.appspot.com",
    messagingSenderId: "1013875354810",
    appId: "1:1013875354810:web:b79e07e37d82cf5d876683",
    measurementId: "G-35SWZL8GXK"
  };

  const app = initializeApp(firebaseConfig); // Init Cloud Firestore
  const db = getFirestore(app);
  const storage = getStorage(app);
  const connectionStatus = useNetInfo();  // Network connection status using useNetInfo hook


  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection Lost!");
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Start' screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name='Start' component={Start} options={{ headerShown: false }} />
        <Stack.Screen name="Chat">
          {(props) => (<Chat isConnected={connectionStatus.isConnected}
                             db={db}
                             storage={storage}
                             {...props} />)}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;