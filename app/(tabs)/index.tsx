import React, { useEffect } from 'react';
import {
  AdMobBanner,
  AdMobInterstitial,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';
import { View, Text } from 'react-native';

function HomeScreen() {
  useEffect(() => {
    const initAds = async () => {
      try {
        await setTestDeviceIDAsync('EMULATOR'); // Test mode on emulator

        await AdMobInterstitial.setAdUnitID('ca-app-pub-3940256099942544/1033173712'); // Test Interstitial
        await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
        await AdMobInterstitial.showAdAsync(); // <-- Don't forget this!
      } catch (err) {
        console.warn('AdMob init error:', err);
      }
    };

    initAds();
  }, []);

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'yellowgreen',
      }}
    >
      <Text>Home</Text>
      {/* <AdMobBanner
        bannerSize="fullBanner"
        adUnitID="ca-app-pub-3940256099942544/6300978111" // Test Banner
        servePersonalizedAds
        onDidFailToReceiveAdWithError={(error) => console.warn('Banner ad error:', error)}
      /> */}
    </View>
  );
}

export default HomeScreen;
