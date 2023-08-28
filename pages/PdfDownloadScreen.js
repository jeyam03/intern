import React, { useState, useCallback, useRef, useEffect } from "react";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScrollView, ActivityIndicator, Linking, Dimensions, View, TouchableOpacity, Text, ToastAndroid } from 'react-native';
import { useTheme } from '../ThemeProvider';
import Pdf from "react-native-pdf";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { useDownloadContext } from '../DownloadContext';

const PdfDownloadScreen = ({ }) => {
  const { paperTheme } = useTheme();
  const { items, addItem, removeItem } = useDownloadContext();

  const [selectedValue, setSelectedValue] = useState();
  const [pdfSource, setPdfSource] = useState();
  const [options, setOptions] = useState([]);

  const checkDownloads = async () => {
    setOptions([]);
    await AsyncStorage.getAllKeys().then((keys) => {
      keys && keys.length > 0 && keys.map((key, index) => {
        AsyncStorage.getItem(key).then((value) => {
          setOptions((prev) => {
            return [...prev, { value: value, label: key }]
          })
        }).catch((error) => {
          console.log(error, 'Error')
        })
      })
    }).catch((error) => {
      console.log(error, 'Error')
    })
  }

  useEffect(() => {
    console.log(items.length, 'Items')
    checkDownloads()
  }, [items])

  useEffect(() => {
    console.log(items, 'Items')
    checkDownloads()
  }, [])

  useEffect(() => {
    if (selectedValue) {
      setPdfSource({ uri: `data:application/pdf;base64,${selectedValue["value"]}`, cache: true })
    }
  }, [selectedValue])

  const removeDownload = async () => {
    try {
      await AsyncStorage.removeItem(selectedValue["label"]);
      ToastAndroid.show('Removed Successfully', ToastAndroid.SHORT);
      removeItem({ label: selectedValue["label"], value: selectedValue["value"] })
      setOptions([])
      setSelectedValue()
      setPdfSource()
      checkDownloads()
    } catch (error) {
      console.log(error, 'Error')
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>

        {options && options.length > 0 ?
          <Dropdown
            label='Select'
            placeholder="Select a downloaded PDF"
            data={options}
            search
            searchPlaceholder="Search..."
            value={selectedValue}
            onChange={(value) => { setSelectedValue(value) }}
            valueField={'value'}
            labelField={'label'}
            style={{ width: '60%' }}
          />
          : <Text>No PDFs Downloaded</Text>
        }


        {selectedValue &&
          <TouchableOpacity onPress={() => removeDownload()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'darkred', padding: 8, borderRadius: 8 }}>
            <Icon name="delete" size={20} color={paperTheme.colors.background} />
            <Text style={{ color: paperTheme.colors.background, marginLeft: 8 }}>Remove</Text>
          </TouchableOpacity>
        }
      </View>

      {pdfSource &&
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
      }

    </View>
  );
};

export default PdfDownloadScreen;