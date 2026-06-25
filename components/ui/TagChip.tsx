import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Palette } from '@/constants/Colors';
import { TAG_COLORS, TagCategory } from '@/constants/Tags';
import { FontFamily, Typography } from '@/constants/Typography';
import { Radius } from '@/constants/Theme';

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
  const containerProps = onPress ? { onPress, activeOpacity: 0.75 } : {};

  return (
    <Container
      style={[
        styles.chip,
        // Solid (selected) vs soft fill, per the design's tag states.
        isActive
          ? { backgroundColor: chipColor }
          : { backgroundColor: `${chipColor}1F` },
      ]}
      {...containerProps}
    >
      <Text
        style={[styles.label, { color: isActive ? Palette.paper100 : chipColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...Typography.chip,
    fontFamily: FontFamily.semiBold,
  },
});
