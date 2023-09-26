import { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AccessibilityInfo } from 'react-native';

const CustomActions = ({
  wrapperStyle,
  iconTextStyle,
  onSend,
  userID,
  storage,
}) => {
  //job is to fetch whatever actionsheet is included in the wrapper. (GiftedChat is wrapper)
  const actionSheet = useActionSheet();

  const onActionPress = () => {
    const options = [
      'Choose from library',
      'Take a pic',
      'Send location',
      'Cancel',
    ];
    //set index of cancel button to use later
    const cancelButtonIndex = options.length - 1;
    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePic();
            return;
          case 2:
            getLocation();
          default:
        }
      }
    );
  };

  //convert image to blob to upload to storage
  const pickImage = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) await uploadAndSendPic(result.assets[0].uri);
      else Alert.alert('Permission denied');
    }
  };

  const takePic = async () => {
    let permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) await uploadAndSendPic(result.assets[0].uri);
      else Alert.alert('Permission denied');
    }
  };

  const getLocation = async () => {
    let permissions = await Location.requestForegroundPermissionsAsync();
    if (permissions?.granted) {
      let location = await Location.getCurrentPositionAsync({});
      if (location) {
        onSend({
          location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
          },
        });
      } else Alert.alert('Permission not granted');
    } else Alert.alert('Permission not granted');
  };

  //generate a unique string for image
  const generateReference = (uri) => {
    const timeStamp = new Date().getTime();
    const imageName = uri.split('/')[uri.split('/').length - 1];
    return `${userID}-${timeStamp}-${imageName}`;
  };

  //XHR required as react native no longer supports the fetch() in the blob conversion
  const convertFileToBlob = async (uri) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (error) {
        reject(new Error('XHR request failed'));
      };
      xhr.responseType = 'blob';

      xhr.open('GET', uri, true);
      xhr.send();
    });
  };

  //for both takePic and pickImage
  const uploadAndSendPic = async (imageURI) => {
    //to call the generateRef function on the uri
    const uniqueRefString = generateReference(imageURI);
    // location and name in storage
    const newUploadRef = ref(storage, uniqueRefString);
    //convert into blob (binary large object)
    const blob = await convertFileToBlob(imageURI);
    // upload it and get a url for download
    uploadBytes(newUploadRef, blob).then(async (snapshot) => {
      console.log('File uploaded sucessfully');
      const imageURL = await getDownloadURL(snapshot.ref);
      //using the image prop of msg obj, send image
      onSend({ image: imageURL });
    });
  };

  return (
<TouchableOpacity
  style={styles.container}
  title="Action button"
  onPress={onActionPress}
  accessible={true} // Set to true to make the component accessible
  accessibilityLabel="Open Action Sheet" // Provide a label for screen readers
>
  <View style={[styles.wrapper, wrapperStyle]}>
    <Text style={[styles.iconText, iconTextStyle]}>+</Text>
  </View>
</TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 20,
    backgroundColor: 'transparent',
    textAlign: 'center',
    marginTop: -4,
  },
});

export default CustomActions;
