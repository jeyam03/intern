import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { getApps, initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable, listAll } from "firebase/storage";
import ReactNativeUUID from 'react-native-uuid';
import notifee from '@notifee/react-native';
import { useTheme } from '../ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Pdf from 'react-native-pdf';
import { MD3DarkTheme } from 'react-native-paper';
import Video from 'react-native-video';

const UploadFiles = () => {
  const { paperTheme } = useTheme();

  const [file, setFile] = useState('');
  const [type, setType] = useState("document")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0);

  // const firebaseConfig = {
  //   apiKey: "AIzaSyAtFz4MiFnZ2PmCNEAdocnJmsE3RYghL40",
  //   authDomain: "intern-3a7d3.firebaseapp.com",
  //   projectId: "intern-3a7d3",
  //   storageBucket: "intern-3a7d3.appspot.com",
  //   messagingSenderId: "599678160419",
  //   appId: "1:599678160419:web:aabeba33ec7743e9bd2b96",
  //   measurementId: "G-2BHKNW5BM6"
  // };
  const firebaseConfig = {
    apiKey: "AIzaSyCdQMaJeUz5TGuV7eLiM7YO63wy2dSFSt0",
    authDomain: "intern2-d6a2c.firebaseapp.com",
    projectId: "intern2-d6a2c",
    storageBucket: "intern2-d6a2c.appspot.com",
    messagingSenderId: "285107883739",
    appId: "1:285107883739:web:589e9a3d2e35280fe4c6fe",
    measurementId: "G-0HEYSTV6GL"
  };

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,
    });
    console.log(result);
    setType(result.assets[0].type)
    handleFilePicked(result);
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

    setType("image");
    handleFilePicked(pickerResult);
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    console.log(result);

    if (result["assets"][0]["size"] > 10000000) {
      alert("File size should be less than 10 MB");
      return;
    }

    setType(result.assets[0].mimeType)
    handleFilePicked(result);
  };

  const handleFilePicked = async (pickerResult) => {
    try {
      setUploading(true);

      if (!pickerResult.canceled) {
        const uploadUrl = await uploadFileAsync(pickerResult.assets[0].uri);
        console.log("Upload URL", uploadUrl);
        setFile(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      setUploading(false);
    }
  };

  async function uploadFileAsync(uri) {
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
    <View style={{ flex: 1, alignItems: 'center', paddingTop: 24, backgroundColor: paperTheme.colors.background, justifyContent: 'center' }}>

      <TouchableOpacity style={{ backgroundColor: paperTheme.colors.primaryContainer, padding: 10, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 }} onPress={pickImage}>
        <Icon name="image" size={24} color={paperTheme.colors.primary} />
        <Text style={{ color: paperTheme.colors.primary, fontSize: 16, fontWeight: '500' }}>Pick an image from camera roll</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 }}>
        <TouchableOpacity style={{ backgroundColor: paperTheme.colors.primaryContainer, padding: 10, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }} onPress={takePhoto}>
          <Icon name="camera" size={24} color={paperTheme.colors.primary} />
          <Text style={{ color: paperTheme.colors.primary, fontSize: 16, fontWeight: '500' }}>Take a photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ backgroundColor: paperTheme.colors.primaryContainer, padding: 10, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }} onPress={pickDocument}>
          <Icon name="file-upload-outline" size={24} color={paperTheme.colors.primary} />
          <Text style={{ color: paperTheme.colors.primary, fontSize: 16, fontWeight: '500' }}>Pick a document</Text>
        </TouchableOpacity>
      </View>

      {!uploading && file && (
        <View style={{ marginTop: 24, alignItems: 'center', flex: 1, width: '100%' }}>
          <Text style={{ color: paperTheme.colors.secondary, fontSize: 16, fontWeight: '500' }}>Upload Completed: </Text>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(file)
            }}
          ><Text numberOfLines={1} ellipsizeMode="middle" style={{ color: paperTheme === MD3DarkTheme ? 'lightblue' : 'blue', textAlign: 'center', paddingHorizontal: 12, padding: 4 }}>{file}</Text></TouchableOpacity>
          {type.startsWith("image") ? (
            <Image
              source={{ uri: file }}
              style={{ width: 300, height: 300, marginTop: 12, borderRadius: 12 }}
            />
          ) : type.startsWith("application/pdf") ? (
            <Pdf
              trustAllCerts={false}
              source={{ uri: file, cache: true, }}
              renderActivityIndicator={() => (
                <ActivityIndicator color="black"
                  size="large" />
              )}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                marginTop: 8,
              }}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Current page: ${page}`);
              }}
              onError={(error) => {
                console.log(error);
              }}
              onPressLink={(uri) => {
                console.log(`Link pressed: ${uri}`);
                Linking.openURL(uri)
              }}
            // onPageSingleTap={(page) => alert(page)}
            />
          ) : type.startsWith("video") && (
            <Video
              source={{ uri: file }}
              rate={1.0}
              volume={1.0}
              resizeMode="contain"
              shouldPlay
              controls
              style={{ width: '100%', height: 220, marginTop: 32, backgroundColor: paperTheme.colors.background }}
            />
          )}
        </View>
      )}

      {uploading &&
        <View style={{
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
        </View>
      }
    </View>
  );
}

export default UploadFiles