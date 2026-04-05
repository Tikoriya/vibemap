import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type CardShadowProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  radius?: number;
};

export const CardShadow = (props: CardShadowProps) => {
  const { children, style, radius = 16 } = props;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: radius,
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        Platform.select({
          ios: {
            shadowColor: isDark ? '#000' : '#1A1714',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 8,
          },
          android: {
            elevation: 3,
          },
        }),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});
