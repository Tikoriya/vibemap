import { AlertCircle } from "lucide-react-native";
import { forwardRef, ReactNode, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

import { Colors, Palette } from "@/constants/Colors";
import { Spacing } from "@/constants/Theme";
import { Typography } from "@/constants/Typography";

// Fixed on-image colors for the "onImage" tone, where theme values would not be
// legible over a photo (allowed Palette use per the design system).
const ON_IMAGE = {
  text: Palette.paper0,
  placeholder: "rgba(251,250,245,0.6)",
  border: "rgba(251,250,245,0.4)",
  borderActive: Palette.paper0,
} as const;

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  leadingIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  tone?: "default" | "onImage";
  variant?: "default" | "title";
};

export const Input = forwardRef<TextInput, InputProps>((props, ref) => {
  const {
    label,
    error,
    leadingIcon,
    containerStyle,
    style,
    multiline,
    tone = "default",
    variant = "default",
    onFocus,
    onBlur,
    ...rest
  } = props;

  const isTitle = variant === "title";

  const [isFocused, setIsFocused] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const onImage = tone === "onImage";

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const labelColor = onImage ? ON_IMAGE.text : theme.text;
  const textColor = onImage ? ON_IMAGE.text : theme.text;
  const placeholderColor = onImage ? ON_IMAGE.placeholder : theme.textMuted;

  const isActive = !!error || isFocused;
  const borderColor = error
    ? theme.error
    : isFocused
      ? onImage
        ? ON_IMAGE.borderActive
        : theme.accent
      : onImage
        ? ON_IMAGE.border
        : theme.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.row,
          multiline && styles.rowMultiline,
          { borderBottomColor: borderColor, borderBottomWidth: isActive ? 2 : 1 },
        ]}
      >
        {leadingIcon ? (
          <View style={styles.leadingIcon}>{leadingIcon}</View>
        ) : null}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            isTitle && styles.inputTitle,
            { color: textColor },
            style,
          ]}
          placeholderTextColor={placeholderColor}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {error ? (
          <AlertCircle
            size={18}
            color={theme.error}
            style={styles.trailingIcon}
          />
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      ) : null}
    </View>
  );
});

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    gap: Spacing.space2,
  },
  label: {
    ...Typography.label,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.space2,
  },
  rowMultiline: {
    alignItems: "flex-start",
    minHeight: 96,
  },
  input: {
    ...Typography.body,
    flex: 1,
    padding: 0,
  },
  inputTitle: {
    ...Typography.title,
  },
  leadingIcon: {
    marginRight: Spacing.space2,
  },
  trailingIcon: {
    marginLeft: Spacing.space2,
  },
  error: {
    ...Typography.secondary,
  },
});
