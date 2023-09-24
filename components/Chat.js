import { useState, useEffect } from "react";
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { collection, onSnapshot } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const Chat = ({ route, navigation, db, isConnected }) => {
  const { name, color } = route.params;
  const [messages, setMessages] = useState([]);

  const onSend = (newMessages) => {
    // Handle sending messages (if needed)
  }

  const renderBubble = (props) => {
    return <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#000"
        },
        left: {
          backgroundColor: "#FFF"
        }
      }}
    />
  }

  useEffect(() => {
    navigation.setOptions({ title: name });
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (isConnected) {
        // Online: Fetch messages from Firestore in real-time
        const unsubscribe = onSnapshot(collection(db, "messages"), (querySnapshot) => {
          let newMessages = [];
          querySnapshot.forEach((doc) => {
            const messageData = doc.data();
            newMessages.push({
              _id: doc.id,
              text: messageData.text,
              createdAt: messageData.createdAt.toDate(),
              user: messageData.user, // Modify this according to your data structure
            });
          });
          setMessages(newMessages);
        });

        // Clean up the listener when the component unmounts
        return () => {
          unsubscribe();
        };
      } else {
        // Offline: Load cached messages from local storage
        try {
          const cachedMessages = await AsyncStorage.getItem("cachedMessages");
          if (cachedMessages) {
            const parsedMessages = JSON.parse(cachedMessages);
            setMessages(parsedMessages);
          }
        } catch (error) {
          console.error("Error loading cached messages:", error);
        }
      }
    };

    fetchMessages();
  }, [db, isConnected]);

  return (
    <View style={{ flex: 1, backgroundColor: color }}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: 1
        }}
        // Disable InputToolbar when offline
        renderInputToolbar={(props) => (
          isConnected ? <GiftedChat.InputToolbar {...props} /> : null
        )}
      />
      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
      {Platform.OS === 'ios' ? <KeyboardAvoidingView behavior="padding" /> : null }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default Chat;
