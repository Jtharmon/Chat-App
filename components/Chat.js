import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useState } from "react";
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { onSnapshot, collection, orderBy, query, addDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView from "react-native-maps";
import { createStackNavigator } from "@react-navigation/stack";



const Chat = ({ db, storage, route, navigation, isConnected }) => {
  const { name, color, userID } = route.params;
  const [messages, setMessages] = useState([]);

  let unsubMessages;

  useEffect(() => {
    // Set screen title according to given name from prop
    navigation.setOptions({ title: name });

    /**
     * If the user is connected to the internet, register a listener to the database
     * to read messages. If the user is offline, load messages from offline storage.
     */
    if (isConnected === true) {
      // Unregister current onSnapshot() listener to avoid registering multiple
      // listeners when useEffect code is re-executed.
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      // Create stream with database to read messages
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubMessages = onSnapshot(q, (docSnap) => {
        let msgList = [];
        docSnap.forEach((doc) => {
          msgList.push({
            id: doc.id,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt.toMillis()),
          });
        });
        cacheMessages(msgList);
        setMessages(msgList);
      });
    } else {
      loadCachedMessages();
    }

    // Clean up code
    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [isConnected]);

  // Save messages to offline storage
  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem("chat", JSON.stringify(messagesToCache));
    } catch (error) {
      console.log(error.message);
    }
  };

  // Get messages from offline storage
  const loadCachedMessages = async () => {
    const cachedChat = await AsyncStorage.getItem("chat");
    cachedChat ? setMessages(JSON.parse(cachedChat)) : setMessages([]);
  };

  // Append new message to firestore
  const onSend = async (newMessages) => {
    await addDoc(collection(db, "messages"), newMessages[0]);
  };

  // Customize chat bubble
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: "#004d01" },
          left: { backgroundColor: "#010f78" },
        }}
        textStyle={{
          left: { color: "#fff" },
        }}
      />
    );
  };

  // Only render text input toolbar when online
  const renderInputToolbar = (props) => {
    if (isConnected) return <InputToolbar {...props} />;
    else return null;
  };

  // Render custom action component
  const renderCustomActions = (props) => {
    return <CustomActions storage={storage} userID={userID} {...props} />;
  };

  // Render element with map and geolocation
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <View
          style={{
            borderRadius: 13,
            margin: 3,
            overflow: "hidden",
          }}
        >
          <MapView
            style={{
              width: 150,
              height: 100,
            }}
            region={{
              latitude: currentMessage.location.latitude,
              longitude: currentMessage.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>
      );
    }
    return null;
  };

  return (
    // Set background color according to given prop color from start screen
    <View style={[styles.container, { backgroundColor: color }]}>
      {/* Chat */}
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        onSend={onSend}
        user={{ _id: userID, name }}
      />
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Chat;
