import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, StyleSheet, View, Platform } from "react-native";
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView from "react-native-maps";

const Chat = ({ isConnected, db, route, navigation, storage }) => {
  const { name, color, userID } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: name });
    if (isConnected) {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const unsubMessages = onSnapshot(q, (docs) => {
        const newMessages = [];
        docs.forEach((doc) => {
          newMessages.push({
            _id: doc.id,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt.toMillis()),
          });
        });
        setMessages(newMessages);
        cacheMessages(newMessages);
      });

      return () => unsubMessages();
    } else {
      loadCachedMessages();
    }
  }, [isConnected]);

  const loadCachedMessages = async () => {
    try {
      const cachedChat = await AsyncStorage.getItem("chat");
      if (cachedChat) {
        const parsedChat = JSON.parse(cachedChat);
        setMessages(parsedChat);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.log("Error loading cached messages:", error.message);
      setMessages([]);
    }
  };

  const cacheMessages = async (messages) => {
    try {
      await AsyncStorage.setItem("chat", JSON.stringify(messages));
    } catch (error) {
      console.log("Error caching messages:", error.message);
    }
  };

  const addMessage = async (newMessage) => {
    const newMessageRef = await addDoc(collection(db, "messages"), newMessage[0]);
    if (!newMessageRef.id) {
      Alert.alert("There was an error sending your message. Please try again later");
    }
  };

  const onSend = (newMessages) => {
    addMessage(newMessages);
  };

  const renderInputToolbar = (props) => {
    if (isConnected) {
      return <InputToolbar {...props} />;
    } else {
      return null;
    }
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: (color === "white" || color === "yellow") ? "black" : "white",
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: color,
          },
          left: {
            backgroundColor: "#FFF",
          },
        }}
      />
    );
  };

  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  useEffect(() => {
    const systemMessage = {
      _id: 1,
      text: "Welcome to the chat!",
      createdAt: new Date(),
      system: true,
    };

    const userMessage = {
      _id: 2,
      text: "Hello, how are you?",
      createdAt: new Date(),
      user: {
        _id: userID,
        name: name,
      },
    };

    setMessages([systemMessage, userMessage]);
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        style={styles.textingBox}
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderCustomView={renderCustomView}
        onSend={onSend}
        user={{
          _id: userID,
        }}
      />
      {Platform.OS === "android" && (
        <KeyboardAvoidingView behavior="height" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textingBox: {
    flex: 1,
  },
});

export default Chat;
