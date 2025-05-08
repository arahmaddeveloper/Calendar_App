// AdScreen.js
import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import {
  AdMobBanner,
  AdMobInterstitial,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';

export default function AdScreen() {
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

  const showInterstitial = async () => {
    await AdMobInterstitial.showAdAsync();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Button title="Show Interstitial Ad" onPress={showInterstitial} />
      <AdMobBanner
        bannerSize="fullBanner"
        adUnitID="ca-app-pub-3940256099942544/6300978111" // TEST banner ad
        servePersonalizedAds
        onDidFailToReceiveAdWithError={(error) => console.warn(error)}
      />
    </View>
  );
}


// import { View, Text } from "react-native";
// import { AdMobBanner } from "expo-ads-admob";

// function HomeScreen() {
//   return (
//     <View>
//       <Text>Home</Text>
//       <View style={{ flex: 1, justifyContent: "flex-end" }}>
//         <AdMobBanner
//           bannerSize="smartBannerPortrait"
//           adUnitID="ca-app-pub-2788147250926306/1933250920"
//           servePersonalizedAds // optional
//           onDidFailToReceiveAdWithError={(error) =>
//             console.log("Ad Error:", error)
//           }
//         />
//       </View>
//     </View>
//   );
// }

// export default HomeScreen
