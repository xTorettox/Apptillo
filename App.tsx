import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AltilloMainScreen } from './src/screens/AltilloMainScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AltilloMainScreen />
    </SafeAreaProvider>
  );
}
