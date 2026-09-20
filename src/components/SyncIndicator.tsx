import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PixelColors } from '../theme/pixelTheme';

interface SyncIndicatorProps {
  statusText: string;
  isSyncing: boolean;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ statusText, isSyncing }) => {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (!isSyncing) {
      setBlink(true);
      return;
    }
    const interval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 400);
    return () => clearInterval(interval);
  }, [isSyncing]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.ledLamp,
          {
            backgroundColor: isSyncing
              ? blink
                ? PixelColors.crtGlowAmber
                : '#332000'
              : PixelColors.successGreen,
          },
        ]}
      />
      <Text style={styles.statusText} numberOfLines={1} ellipsizeMode="tail">
        {statusText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0612',
    borderWidth: 2,
    borderColor: PixelColors.woodHighlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 8,
  },
  ledLamp: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: PixelColors.crtGlowCyan,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
