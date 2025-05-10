
import React, { useEffect } from 'react';
// import { View, Button } from 'react-native';
import {
  AdMobBanner,
  AdMobInterstitial,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';

// export default function HomeScreen() {
//   useEffect(() => {
//     const initAds = async () => {
//       await setTestDeviceIDAsync('EMULATOR'); // 'EMULATOR' tells AdMob it's test mode

//       await AdMobInterstitial.setAdUnitID(
//         'ca-app-pub-3940256099942544/1033173712' // TEST interstitial ad
//       );
//       await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
//     };

//     initAds();
//   }, []);

//   const showInterstitial = async () => {
//     await AdMobInterstitial.showAdAsync();
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center' }}>
//       <Button title="Show Interstitial Ad" onPress={showInterstitial} />
//       <AdMobBanner
//         bannerSize="fullBanner"
//         adUnitID="ca-app-pub-3940256099942544/6300978111" // TEST banner ad
//         servePersonalizedAds
//         onDidFailToReceiveAdWithError={(error) => console.warn(error)}
//       />
//     </View>
//   );
// }


import { View, Text } from "react-native";

function HomeScreen() {
   useEffect(() => {
    const initAds = async () => {
      await setTestDeviceIDAsync('EMULATOR'); // 'EMULATOR' tells AdMob it's test mode

      await AdMobInterstitial.setAdUnitID(
        'ca-app-pub-3940256099942544/1033173712' // TEST interstitial ad
      );
      await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
    };

    initAds();
  }, []);
  return (
    <View
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "yellowgreen"
    }}
    >
      <Text>Home</Text>
       <AdMobBanner
        bannerSize="fullBanner"
        adUnitID="ca-app-pub-3940256099942544/6300978111" // TEST banner ad
        servePersonalizedAds
        onDidFailToReceiveAdWithError={(error) => console.warn(error)}
      />
    </View>
  );
}

export default HomeScreen
