import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GAP = 3;

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

  if (photos.length === 2) {
    const imgWidth = (SCREEN_WIDTH - GAP) / 2;
    return (
      <View style={styles.row}>
        <Image source={{ uri: photos[0] }} style={[styles.halfImage, { width: imgWidth }]} resizeMode="cover" />
        <Image source={{ uri: photos[1] }} style={[styles.halfImage, { width: imgWidth }]} resizeMode="cover" />
      </View>
    );
  }

  // 3+ photos: large left, up to 2 stacked right
  const leftWidth = (SCREEN_WIDTH - GAP) * 0.6;
  const rightWidth = SCREEN_WIDTH - GAP - leftWidth;
  const collageHeight = 260;
  const rightItemHeight = (collageHeight - GAP) / 2;

  return (
    <View style={[styles.row, { height: collageHeight }]}>
      <Image
        source={{ uri: photos[0] }}
        style={{ width: leftWidth, height: collageHeight }}
        resizeMode="cover"
      />
      <View style={[styles.rightCol, { width: rightWidth }]}>
        <Image
          source={{ uri: photos[1] }}
          style={{ width: rightWidth, height: rightItemHeight }}
          resizeMode="cover"
        />
        <View style={{ height: GAP }} />
        <Image
          source={{ uri: photos[2] }}
          style={{ width: rightWidth, height: rightItemHeight }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  single: {
    width: "100%",
  },
  singleImage: {
    width: "100%",
    height: 240,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
    width: "100%",
  },
  halfImage: {
    height: 200,
  },
  rightCol: {
    flexDirection: "column",
  },
});
