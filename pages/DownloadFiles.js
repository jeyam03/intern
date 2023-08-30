import React, { useState, useEffect } from 'react';
import { Image, View, Platform, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getApps, initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, listAll, getMetadata } from "firebase/storage";
import * as FileSystem from 'expo-file-system'
import { shareAsync } from 'expo-sharing';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { MD3DarkTheme } from 'react-native-paper';

const DownloadFiles = () => {
  const { paperTheme } = useTheme();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const getAllImagesStored = async () => {
    setLoading(true);
    setFiles([]);

    const listRef = ref(getStorage(), '/');
    const result = await listAll(listRef);

    result.items.forEach(async (item) => {
      const metadata = await getMetadata(item)
      const url = await getDownloadURL(item);

      setFiles((prev) => [...prev,
      {
        path: metadata.fullPath,
        time: metadata.timeCreated,
        type: metadata.contentType,
        size: metadata.size,
        url: url
      }
      ]);
    });

    setLoading(false);
  }

  useEffect(() => {
    getAllImagesStored();
  }, [])

  const saveToDevice = async (item) => {
    const filename = `${item.path}.${item.type.split('/')[1]}`

    notifee.displayNotification({
      title: `Downloading file`,
      body: `${filename}`,
      android: {
        channelId: 'download',
        importance: AndroidImportance.HIGH,
      },
    });


    const result = await FileSystem.downloadAsync(
      item.url,
      FileSystem.documentDirectory + filename
    )
    console.log(result)
    save(result.uri, filename, result.headers["Content-Type"]);

    notifee.displayNotification({
      title: `Downloaded successfully`,
      body: `${filename}`,
      android: {
        channelId: 'download',
        importance: AndroidImportance.HIGH,
      },
    });

  }

  const save = async (uri, filename, mimetype) => {
    if (Platform.OS === "Android") {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
          })
          .catch(e => console.log(e));
      } else {
        shareAsync(uri);
      }
    } else {
      shareAsync(uri);
    }
  };

  return (
    <ScrollView style={{ paddingVertical: 30, paddingHorizontal: 20, backgroundColor: paperTheme.colors.background }}>
      {loading &&
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={paperTheme.colors.tertiary} />
        </View>
      }

      {!loading && files?.length > 0 && files.map((file, index) => {
        const dateTime = new Date(file.time);

        const checkSize = file.size / 1000;
        let size = '';
        if (checkSize > 1000) {
          size = `${(checkSize / 1000).toFixed(2)} MB`
        } else {
          size = `${checkSize.toFixed(2)} KB`
        }

        return (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flexDirection: 'column', width: '60%', marginRight: 8, gap: 1 }}>
              <Text numberOfLines={1} ellipsizeMode="middle" style={{ color: paperTheme.colors.tertiary, fontSize: 14 }}>{file.path}</Text>
              <Text style={{ color: paperTheme === MD3DarkTheme ? 'white' : 'black', fontSize: 12 }}>{dateTime.toDateString()} {dateTime.toLocaleTimeString()}</Text>
              <Text style={{ color: paperTheme === MD3DarkTheme ? 'lightgray' : 'dimgray', fontSize: 12, fontWeight: '500' }}>{size}</Text>
            </View>
            {
              file.type.startsWith('image') ?
                <Image
                  style={{ width: 40, height: 40, borderRadius: 10 }}
                  source={{ uri: file.url, }}
                /> : file.type.startsWith('application/pdf') ?
                  <Image
                    style={{ width: 40, height: 40, resizeMode: 'contain' }}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/4208/4208479.png',
                    }}
                  /> : file.type.startsWith('video') &&
                  <Icon name='movie-play-outline' size={32} color={paperTheme.colors.tertiary} />
            }
            <TouchableOpacity onPress={() => saveToDevice(file)}>
              <Icon name='download' size={30} color={paperTheme.colors.tertiary} />
            </TouchableOpacity>
          </View>
        )
      })}

    </ScrollView>
  )
}

export default DownloadFiles