import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { PixelColors } from '../theme/pixelTheme';

interface PixelBoxProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  bgColor?: string;
  focused?: boolean;
}

export const PixelBox: React.FC<PixelBoxProps> = ({
  children,
  style,
  borderColor = PixelColors.woodHighlight,
  bgColor = PixelColors.woodDark,
  focused = false,
}) => {
  return (
    <View
      style={[
        styles.outerBox,
        {
          borderColor: focused ? PixelColors.focusYellow : borderColor,
          backgroundColor: focused ? PixelColors.woodMedium : bgColor,
        },
        focused && styles.focusedGlow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  outerBox: {
    borderWidth: 3,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  focusedGlow: {
    shadowColor: PixelColors.crtGlowCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 10,
  },
});
