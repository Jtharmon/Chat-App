import { useEffect, useState } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  orderBy,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";

const ChatScreen = ({ db, route, navigation, isConnected, storage }) => {
  const { name, color, userID } = route.params;
  const [messages, setMessages] = useState([]);

  let unsubMessages;

  useEffect(() => {
    // brings name from StartScreen to ChatScreen
    navigation.setOptions({ title: name });

    if (isConnected === true) {
      // unregister to avoid registering multiple listener
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      // listener on query to target messages collection
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubMessages = onSnapshot(q, (docs) => {
        let newMessages = [];
        docs.forEach((doc) => {
          newMessages.push({
            id: doc.id,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt.toMillis()),
          });
        });
        cacheMessages(newMessages);
        setMessages(newMessages);
      });
    } else loadCachedMessages(); // if connection is false

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [isConnected]);

  //call function if isConnected is false in useEffect
  const loadCachedMessages = async () => {
    const cachedMessages = (await AsyncStorage.getItem("messages")) || [];
    setMessages(JSON.parse(cachedMessages));
  };
  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem("messages", JSON.stringify(messagesToCache));
    } catch (error) {
      console.log(error.message);
    }
  };

  {
    /* Function when user sends a message */
  }
  const onSend = (newMessages) => {
    // save sent messages on Firestore database
    addDoc(collection(db, "messages"), newMessages[0]);
  };

  // prevent user compose new messages when offline
  const renderInputToolbar = (props) => {
    if (isConnected === true) {
      return <InputToolbar {...props} />;
    } else {
      return null;
    }
  };

  {
    /* Change speech bubble color */
  }
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#000",
          },
          left: {
            backgroundColor: "#FFF",
          },
        }}
      />
    );
  };

  // action menu with circle button +
  const renderCustomActions = (props) => {
    return <CustomActions onSend={onSend} storage={storage} {...props} />;
  };

  // check if message conatins location data, if yes render map
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
  <MapView
    style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
    region={{
    latitude: 39.7684, // Latitude of Indianapolis, Indiana
    longitude: -86.1581, // Longitude of Indianapolis, Indiana
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
  />
  );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      {/* Render chat interface */}
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userID,
          name,
        }}
      />
      {/* Fix android keyboard that hides message input field */}
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // allow outer view to expand 100% of screen
  container: {
    flex: 1,
  },
});

export default ChatScreen;