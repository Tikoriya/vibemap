import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TAG_COLORS, TagCategory } from '@/constants/Tags';
import { Typography } from '@/constants/Typography';

type TagChipProps = {
  label: string;
  category?: TagCategory;
  color?: string;
  isActive?: boolean;
  onPress?: () => void;
};

export const TagChip = (props: TagChipProps) => {
  const { label, category, color, isActive = false, onPress } = props;
  const chipColor = color ?? (category ? TAG_COLORS[category] : TAG_COLORS.custom);

  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress
    ? { onPress, activeOpacity: 0.75 }
    : {};

  return (
    <Container
      style={[
        styles.chip,
        { backgroundColor: isActive ? chipColor : `${chipColor}22` },
      ]}
      {...containerProps}
    >
      <Text
        style={[
          styles.label,
          { color: isActive ? '#FFFFFF' : chipColor },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    ...Typography.chip,
  },
});
