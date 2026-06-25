import { Colors, Palette } from "@/constants/Colors";
import { Radius } from "@/constants/Theme";
import { FontFamily } from "@/constants/Typography";
import { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  theme: typeof Colors.light;
};

export const TagInput = (props: Props) => {
  const { value, onChange, theme } = props;
  const [inputText, setInputText] = useState("");
  const [activeChipWidth, setActiveChipWidth] = useState(80);
  const inputRef = useRef<TextInput>(null);
  const isActive = inputText.length > 0;

  const commitTag = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputText("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }) => {
    if (e.nativeEvent.key === "Backspace" && inputText === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      style={[
        styles.container,
        { borderColor: theme.border, backgroundColor: theme.surface },
      ]}
    >
      {/* Finalized chips */}
      {value.map((tag, i) => (
        <View key={i} style={[styles.chip, { backgroundColor: theme.accent }]}>
          <Text style={styles.chipLabel}>{tag}</Text>
          <TouchableOpacity
            onPress={() => removeTag(i)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Text style={styles.chipRemove}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/*
        Invisible text used to measure the natural width of the typed string
        so the active chip can match it. Positioned out of flow via absolute.
      */}
      <Text
        style={styles.hiddenMeasure}
        onLayout={(e) =>
          setActiveChipWidth(Math.max(72, e.nativeEvent.layout.width + 36))
        }
      >
        {inputText || "m"}
      </Text>

      {/*
        Single TextInput always mounted inside a View that changes style.
        Swapping two separate TextInput elements on first keystroke caused the
        ref to detach, losing keyboard focus immediately after typing one character.
      */}
      <View
        style={
          isActive
            ? [styles.activeChip, { borderColor: theme.accent, width: activeChipWidth }]
            : styles.plainInputWrapper
        }
      >
        <TextInput
          ref={inputRef}
          style={[
            isActive ? styles.activeChipInput : styles.plainInput,
            { color: isActive ? theme.text : theme.textSecondary },
          ]}
          placeholder={value.length === 0 ? "Add a tag..." : "+ tag"}
          placeholderTextColor={theme.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={commitTag}
          onKeyPress={handleKeyPress}
          returnKeyType="done"
          blurOnSubmit={false}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    minHeight: 50,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.full,
    paddingLeft: 14,
    paddingRight: 9,
    paddingVertical: 7,
    gap: 4,
  },
  chipLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    color: Palette.paper100,
  },
  chipRemove: {
    fontFamily: FontFamily.regular,
    fontSize: 17,
    lineHeight: 20,
    color: "rgba(244,241,232,0.75)",
  },
  activeChip: {
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  activeChipInput: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    padding: 0,
    margin: 0,
  },
  plainInputWrapper: {
    minWidth: 80,
  },
  plainInput: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    padding: 0,
    margin: 0,
  },
  hiddenMeasure: {
    position: "absolute",
    fontFamily: FontFamily.medium,
    fontSize: 13,
    opacity: 0,
    pointerEvents: "none",
  },
});
