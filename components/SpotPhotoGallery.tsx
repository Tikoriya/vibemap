import { Radius, Spacing } from "@/constants/Theme";
import React from "react";
import { Dimensions, Image, ScrollView, StyleSheet, View } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GALLERY_HEIGHT = 260;
const ITEM_WIDTH = SCREEN_WIDTH * 0.78;

type Props = {
  photos: string[];
};

export const SpotPhotoGallery = (props: Props) => {
  const { photos } = props;

  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <View style={styles.single}>
        <Image source={{ uri: photos[0] }} style={styles.singleImage} resizeMode="cover" />
      </View>
    );
  }

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
          style={styles.galleryImage}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  single: {
    width: "100%",
    paddingHorizontal: Spacing.space4,
  },
  singleImage: {
    width: "100%",
    height: 240,
    borderRadius: Radius.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.space4,
    gap: Spacing.space3,
  },
  galleryImage: {
    width: ITEM_WIDTH,
    height: GALLERY_HEIGHT,
    borderRadius: Radius.lg,
  },
});
