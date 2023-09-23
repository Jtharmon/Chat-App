import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { getAuth, signInAnonymously } from 'firebase/auth';

const bgColors = {
  black: { backgroundColor: '#090C08' },
  purple: { backgroundColor: '#474056' },
  blue: { backgroundColor: '#8A95A5' },
  green: { backgroundColor: '#B9C6AE' },
};

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(bgColors.black);

  //firebase auth
  const auth = getAuth();

  //anonymous authentication, passes uid, name and color
  const signInUser = () => {
    signInAnonymously(auth)
      .then((result) => {
        navigation.navigate('Chat', {
          userID: result.user.uid,
          name: name,
          color: color,
        });
        //Alert.alert('Signed in Successfully');
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('Unable to sign in');
      });
  };


  return (
    <View style={styles.container}>
        <Text
          style={[
            styles.appTitle,
            Platform.OS === 'ios' && { paddingTop: 30 },
          ]}>
          Chat!
        </Text>
        <KeyboardAvoidingView
          style={[styles.whiteBox, styles.ios]}
          behavior="padding">
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor="rgba(117, 128, 131, 0.5)"
          />
          <Text style={styles.bgColor}>Choose Background Color:</Text>
          <View style={styles.colorContainer}>
            <TouchableOpacity
              style={[styles.circle, bgColors.black]}
              onPress={() => {
                //console.log('Selected color:', bgColors.black.backgroundColor);
                setColor(bgColors.black);
              }}></TouchableOpacity>
            <TouchableOpacity
              style={[styles.circle, bgColors.purple]}
              onPress={() => setColor(bgColors.purple)}></TouchableOpacity>
            <TouchableOpacity
              style={[styles.circle, bgColors.blue]}
              onPress={() => setColor(bgColors.blue)}></TouchableOpacity>
            <TouchableOpacity
              style={[styles.circle, bgColors.green]}
              onPress={() => setColor(bgColors.green)}></TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, { display: 'flex' }]}
            onPress={signInUser}>
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>
          {/* {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView behavior="padding"/>) : null}*/}
        </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appTitle: {
    flex: 2,
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    alignSelf: 'center',
    paddingTop: 75,
  },
  yourName: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(117, 128, 131, 0.5)',
  },
  textInput: {
    fontSize: 16,
    fontWeight: '300',
    width: '88%',
    padding: 15,
    borderWidth: 1,
    justifyContent: 'center',
    color: '#757083',
    borderColor: '#757083',
  },
  bgColor: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(117, 128, 131, 1)',
    paddingTop: 10,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 10,
  },
  whiteBox: {
    flex: 1.2,
    backgroundColor: 'white',
    width: '88%',
    height: '44%',
    alignItems: 'center',
    margin: 25,
    alignSelf: 'center',
    padding: 25,
    borderRadius: 15,
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    width: '88%',
    height: 45,
    backgroundColor: '#757083',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 18,
  },
  icon: {
    marginRight: 10,
  },
  ios: {},
});

export default Start;