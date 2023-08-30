import React, { useState, useCallback, useRef, useEffect } from "react";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScrollView, ActivityIndicator, Linking, Dimensions, View, TouchableOpacity, Text, ToastAndroid } from 'react-native';
import { useTheme } from '../ThemeProvider';
import Pdf from "react-native-pdf";
import ReactNativeBlobUtil from "react-native-blob-util";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { useDownloadContext } from '../DownloadContext';
import * as FileSystem from 'expo-file-system'
import { shareAsync } from 'expo-sharing';
import { MD3DarkTheme } from "react-native-paper";

const PdfViewScreen = ({ }) => {
  const { paperTheme } = useTheme();
  const { items, addItem, removeItem } = useDownloadContext();

  const [selectedValue, setSelectedValue] = useState({ "_index": 0, "label": "Sample PDF One", "value": "pdf1" });
  const [pdfSource, setPdfSource] = useState({ uri: 'https://www.africau.edu/images/default/sample.pdf', cache: true });
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const pdfsDict = {
    pdf1: 'https://www.africau.edu/images/default/sample.pdf',
    pdf2: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf',
    pdf3: 'https://drive.google.com/file/d/1rrE9E_BuSHGEYUP-avqHC_KS7BoY-DeV/view?usp=drive_link'
  }

  // Google Drive Links to Direct Links
  useEffect(() => {
    Object.keys(pdfsDict).map((key, index) => {
      if (pdfsDict[key].startsWith('https://drive.google.com/file/d/')) {
        pdfsDict[key] = `https://drive.google.com/uc?id=${pdfsDict[key].split('/')[5]}`
      }
    })
  }, [pdfsDict])

  const downloadPDF = () => {
    ReactNativeBlobUtil.fetch('GET', pdfsDict[selectedValue["value"]], {})
      .then((res) => {
        let status = res.info().status;

        if (status == 200) {
          AsyncStorage.setItem(selectedValue["label"], res.base64()).then(() => {
            console.log(`${selectedValue["label"]} Downloaded`)
            ToastAndroid.show(`${selectedValue["label"]} Downloaded`, ToastAndroid.SHORT);
            addItem({ label: selectedValue["label"], value: res.base64() })
            checkDownloaded()
          }).catch((error) => {
            console.log(error, 'Error')
          })
        }
        else {
          console.log('Error ', status)
        }
      })
      .catch((errorMessage, statusCode) => {
        console.log(errorMessage, statusCode)
      })
  }

  const saveToDevice = async () => {
    const filename = `${selectedValue["label"]}.pdf`
    const result = await FileSystem.downloadAsync(
      pdfsDict[selectedValue["value"]],
      FileSystem.documentDirectory + filename
    )
    console.log(result)
    save(result.uri, filename, result.headers["Content-Type"]);
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

  const checkDownloaded = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys.includes(selectedValue["label"])) {
        setPdfDownloaded(true)
      } else {
        setPdfDownloaded(false)
      }
    } catch (error) {
      console.log(error, 'Error')
    }
  }

  useEffect(() => {
    try {
      AsyncStorage.getAllKeys().then((result) => {
        result.map((key, index) => {
          AsyncStorage.getItem(key).then((value) => {
            addItem({ label: key, value: value })
          })
        })
      })
    } catch (error) {
      console.log(error, 'Error')
    }
  }, [])

  useEffect(() => {
    setPdfSource({ uri: pdfsDict[selectedValue["value"]], cache: true })
    checkDownloaded()
  }, [selectedValue])

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background, gap: 8 }}>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
        <Dropdown
          label='Select'
          data={[
            { value: 'pdf1', label: 'Sample PDF One' },
            { value: 'pdf2', label: 'Sample PDF Two' },
            { value: 'pdf3', label: 'Sample PDF Three' },
          ]}
          search
          searchPlaceholder="Search..."
          value={selectedValue}
          onChange={(value) => { setSelectedValue(value) }}
          valueField={'value'}
          labelField={'label'}
          activeColor={paperTheme.colors.primary}
          selectedTextStyle={{ color: paperTheme.colors.primary }}
          style={{ width: '50%' }}
        />

        {selectedValue["value"] !== 'pdf3' && (
          pdfDownloaded ?
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: paperTheme === MD3DarkTheme ? 'lightgreen' : 'darkgreen', padding: 8, borderRadius: 8 }}>
              <Icon name="check" size={20} color={paperTheme.colors.background} />
              <Text style={{ color: paperTheme.colors.background, marginLeft: 8 }}>Downloaded</Text>
            </View>
            :
            <TouchableOpacity onPress={() => downloadPDF()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: paperTheme.colors.primary, padding: 8, borderRadius: 8 }}>
              <Icon name="download" size={20} color={paperTheme.colors.background} />
              <Text style={{ color: paperTheme.colors.background, marginLeft: 8 }}>Download</Text>
            </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20 }}>
        {selectedValue["value"] === 'pdf2' && (
          <TouchableOpacity onPress={() => { saveToDevice() }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: paperTheme.colors.tertiary, padding: 8, borderRadius: 8 }}>
            <Icon name="share" size={20} color={paperTheme.colors.background} />
            <Text style={{ color: paperTheme.colors.background, marginLeft: 8 }}>Save to Device</Text>
          </TouchableOpacity>
        )}
      </View>

      <Pdf
        trustAllCerts={false}
        source={pdfSource}
        renderActivityIndicator={() => (
          <ActivityIndicator color="black"
            size="large" />
        )}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
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

    </View>
  );
};

export default PdfViewScreen;