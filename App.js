import React, { useState, useEffect ,useRef } from 'react';
import { Text, View, StyleSheet, Button} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned')
  const [text1, setText1] = useState('')
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { captureViewRef, onCapture } = useCapture();
  function useCapture() {
    const captureViewRef = useRef();

    function onCapture() {
      captureRef(captureViewRef, {
        format: "jpg",
        quality: 0.9
      }).then(
        uri => alert(uri), 
        error => alert("Oops, snapshot failed", error));
    }

    return {
      captureViewRef,
      onCapture
    };
  }
  
const askForLocationPermission = () =>{
  (async () => {
      
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  })();
}
  useEffect(() => {
   askForLocationPermission();
  }, );

  let Text1 = 'Waiting..';
  if (errorMsg) {
    Text1 = errorMsg;
  } else if (location) {
    Text1 = JSON.stringify(location);
  }
  const storeData = async () => {
    try {
      await AsyncStorage.setItem('Qr_data', text)
    } catch (e) {
      console.log(errorMsg)
    }
  }
  useEffect(()=>{
    storeData();
 },)
 
const getData = async () => {
  try {
    const text = await AsyncStorage.getItem('Qr_data')
    if(text !== null) {
     setText1(text)
    }
  } catch(e) {
    console.log(errorMsg)
  }
}
useEffect(()=>{
    getData();
},)
  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })()
  }
  useEffect(() => {
    askForCameraPermission();
  }, []);
  const handleBarCodeScanned = ({ type, data }) => {
    onCapture()
    storeData()
    setScanned(true);
    setText(data)
    console.log('Type: ' + type + '\nData: ' + data)
  };
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Button title={'Request for camera'} onPress={() => askForCameraPermission()} style={{ backgroundColor: "red" , fontSize: 20}}>Requesting for camera permission</Button>
      </View>)
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </View>)
  }
  return (
    <View style={styles.container}>
      <View ref={captureViewRef} style={styles.barcodebox}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ height: 400, width: 400  }} />
      </View>
      <Text style={styles.maintext1}>Qr Code Scanner</Text>
      <Text style={styles.maintext}>info- {text}</Text>
      <Text style={styles.maintext}>Storage info- {text1}</Text>
      <Text style={styles.maintext}>Location : {Text1}</Text>

      {scanned && <Button title={'Scan again?'} onPress={() => setScanned(false)} color='blue' />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintext: {
    paddingLeft:4,
    borderRadius:10,
    width:'auto',
    height:'auto',
    borderWidth:2,
    borderColor:'pink',
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: "black"
  },
  maintext1:{
   fontSize:20
   
  }
});
