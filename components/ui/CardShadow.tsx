import { StyleSheet, View, ViewStyle } from 'react-native';

import { Colors } from '@/constants/Colors';
import { Elevation, Radius } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';

type CardShadowProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  radius?: number;
};

export const CardShadow = (props: CardShadowProps) => {
  const { children, style, radius = Radius.lg } = props;
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
        Elevation.card,
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
