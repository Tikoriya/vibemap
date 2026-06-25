import { Colors } from "@/constants/Colors";
import { Elevation, Radius, Spacing } from "@/constants/Theme";
import { FontFamily } from "@/constants/Typography";
import { Camera, X } from "lucide-react-native";
import React, { useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Sortable,
  SortableDirection,
  SortableItem,
  SortableRenderItemProps,
} from "react-native-reanimated-dnd";

export type EditablePhoto = {
  id?: number;
  uri: string;
};

type SortablePhoto = {
  id: string;
  uri: string;
  photoId?: number;
};

type Props = {
  photos: EditablePhoto[];
  onReorder: (photos: EditablePhoto[]) => void;
  onRemove: (photo: EditablePhoto) => void;
  onAdd: () => void;
  theme: typeof Colors.light;
};

const THUMB_SIZE = 84;
const GAP = Spacing.space2;

export const SpotPhotoEditor = (props: Props) => {
  const { photos, onReorder, onRemove, onAdd, theme } = props;

  const data: SortablePhoto[] = photos.map((p) => ({
    id: p.uri,
    uri: p.uri,
    photoId: p.id,
  }));

  // onDrop fires once for the dragged item with the final position map, so we
  // rebuild the canonical order from it and lift it up to the form state.
  const handleDrop = useCallback(
    (
      _id: string,
      _position: number,
      allPositions?: { [id: string]: number },
    ) => {
      if (!allPositions) return;
      const ordered = [...photos].sort(
        (a, b) => (allPositions[a.uri] ?? 0) - (allPositions[b.uri] ?? 0),
      );
      onReorder(ordered);
    },
    [photos, onReorder],
  );

  const renderItem = useCallback(
    (itemProps: SortableRenderItemProps<SortablePhoto>) => {
      const {
        item,
        index,
        id,
        positions,
        leftBound,
        autoScrollHorizontalDirection,
        itemsCount,
        itemWidth,
        gap,
        paddingHorizontal,
      } = itemProps;

      return (
        <SortableItem
          key={id}
          id={id}
          data={item}
          positions={positions}
          leftBound={leftBound}
          autoScrollHorizontalDirection={autoScrollHorizontalDirection}
          itemsCount={itemsCount}
          direction={SortableDirection.Horizontal}
          itemWidth={itemWidth}
          gap={gap}
          paddingHorizontal={paddingHorizontal}
          onDrop={handleDrop}
          style={styles.thumbWrap}
        >
          <Image
            source={{ uri: item.uri }}
            style={[styles.thumb, { backgroundColor: theme.border }]}
            resizeMode="cover"
          />

          {index === 0 ? (
            <View style={[styles.coverBadge, { backgroundColor: theme.accent }]}>
              <Text style={[styles.coverText, { color: theme.onAccent }]}>
                Cover
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.removeBtn, { backgroundColor: theme.surface }]}
            onPress={() => onRemove({ id: item.photoId, uri: item.uri })}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <X size={14} color={theme.text} />
          </TouchableOpacity>
        </SortableItem>
      );
    },
    [handleDrop, onRemove, theme],
  );

  return (
    <View style={styles.row}>
      {data.length > 0 ? (
        <View style={styles.sortableWrap}>
          <Sortable
            data={data}
            renderItem={renderItem}
            direction={SortableDirection.Horizontal}
            itemWidth={THUMB_SIZE}
            gap={GAP}
            paddingHorizontal={0}
            style={styles.sortable}
          />
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.addTile,
          { borderColor: theme.border, backgroundColor: theme.surface },
        ]}
        onPress={onAdd}
        activeOpacity={0.7}
      >
        <Camera size={24} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAP,
    height: THUMB_SIZE,
  },
  sortableWrap: {
    flex: 1,
    height: THUMB_SIZE,
  },
  sortable: {
    backgroundColor: "transparent",
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    position: "relative",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.md,
  },
  coverBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  coverText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    ...Elevation.flat,
  },
  addTile: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
});
