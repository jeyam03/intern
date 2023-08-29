import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getApps, initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import ReactNativeUUID from 'react-native-uuid';
import notifee from '@notifee/react-native';
import { useTheme } from '../ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UploadFiles = () => {
  const { paperTheme } = useTheme();

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0);

  const firebaseConfig = {
    apiKey: "AIzaSyAtFz4MiFnZ2PmCNEAdocnJmsE3RYghL40",
    authDomain: "intern-3a7d3.firebaseapp.com",
    projectId: "intern-3a7d3",
    storageBucket: "intern-3a7d3.appspot.com",
    messagingSenderId: "599678160419",
    appId: "1:599678160419:web:aabeba33ec7743e9bd2b96",
    measurementId: "G-2BHKNW5BM6"
  };

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });
    console.log(result);
    handleImagePicked(result);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    handleImagePicked(pickerResult);
  };

  const handleImagePicked = async (pickerResult) => {
    try {
      setUploading(true);

      if (!pickerResult.canceled) {
        const uploadUrl = await uploadImageAsync(pickerResult.assets[0].uri);
        console.log("Upload URL", uploadUrl);
        setImage(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      setUploading(false);
    }
  };

  async function uploadImageAsync(uri) {
    await notifee.displayNotification({
      id: 'upload',
      title: 'Uploading...',
      android: {
        channelId: 'upload',
        progress: {
          max: 100,
          current: 0,
        },
      },
    });

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    console.log('blob');

    const fileRef = ref(getStorage(), ReactNativeUUID.v4());
    // const result = await uploadBytes(fileRef, blob);

    const uploadTask = uploadBytesResumable(fileRef, blob);

    uploadTask.on('state_changed',
      (snapshot) => {
        const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Progress: ${currentProgress}%`);
        setProgress(currentProgress);

        notifee.displayNotification({
          id: 'upload',
          android: {
            channelId: 'upload',
            progress: {
              max: 100,
              current: currentProgress,
            },
          },
        });

        if (snapshot.bytesTransferred === snapshot.totalBytes) {
          notifee.displayNotification({
            id: 'upload',
            title: 'Upload Completed',
            android: {
              channelId: 'upload',
              progress: {
                indeterminate: true,
              },
            },
          });
        }
      },
      (error) => {
        console.log(error);
      },
      () => {
        console.log('Upload is complete');
        notifee.cancelNotification('upload');
        blob.close();
      }
    );

    await uploadTask;

    return await getDownloadURL(fileRef);
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

      <TouchableOpacity style={{ backgroundColor: paperTheme.colors.primaryContainer, padding: 10, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }} onPress={pickImage}>
        <Icon name="image" size={24} color={paperTheme.colors.primary} />
        <Text style={{ color: paperTheme.colors.primary, fontSize: 16, fontWeight: '500' }}>Pick an image from camera roll</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ backgroundColor: paperTheme.colors.primaryContainer, padding: 10, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 }} onPress={takePhoto}>
        <Icon name="camera" size={24} color={paperTheme.colors.primary} />
        <Text style={{ color: paperTheme.colors.primary, fontSize: 16, fontWeight: '500' }}>Take a photo</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={{
        width: 300,
        height: 300,
        borderRadius: 12,
        marginTop: 20,
      }} />}

      {uploading && <View style={{
        width: 350,
        height: 40,
        backgroundColor: 'lightgray',
        borderRadius: 12,
        margin: 20,
      }}>
        <View style={{
          width: `${progress}%`,
          height: 40,
          backgroundColor: 'lightgreen',
          borderRadius: 12,
          padding: 10,
        }} />
        <Text style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: 'black',
          fontWeight: '500',
        }}>Uploading {progress.toFixed(2)}%</Text>
      </View>}
    </View>
  );
}

export default UploadFiles