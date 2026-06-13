import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Typography";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type Props = {
  photos: string[];
  onRemove?: (url: string) => void;
};

export const ImportedPhotos = (props: Props) => {
  const { photos, onRemove } = props;
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const visible = photos.filter((url) => !failedUrls.has(url));

  if (visible.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {visible.map((url) => (
        <View key={url} style={styles.thumbWrap}>
          <Image
            source={{ uri: url }}
            style={[styles.thumb, { backgroundColor: theme.border }]}
            resizeMode="cover"
            onError={() =>
              setFailedUrls((prev) => new Set([...prev, url]))
            }
          />
          {onRemove ? (
            <TouchableOpacity
              style={[styles.removeBtn, { backgroundColor: theme.surface }]}
              onPress={() => onRemove(url)}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={[styles.removeIcon, { color: theme.text }]}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
};

const THUMB_SIZE = 88;

const styles = StyleSheet.create({
  strip: {
    gap: 8,
    paddingVertical: 2,
  },
  thumbWrap: {
    position: "relative",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  removeIcon: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
});
