import { Radius, Spacing } from "@/constants/Theme";
import React from "react";
import { Image, ScrollView, StyleSheet } from "react-native";

const THUMB_WIDTH = 124;
const THUMB_HEIGHT = 156;

type Props = {
  photos: string[];
};

export const SpotPhotoGallery = (props: Props) => {
  const { photos } = props;

  if (photos.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {photos.map((uri, index) => (
        <Image
          key={`${uri}-${index}`}
          source={{ uri }}
          style={styles.thumb}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.space3,
  },
  thumb: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: Radius.lg,
  },
});
