import googleApi, { PlaceDetail } from '@/lib/services/google';
import { useAutoComplete } from '@/hooks/useAutoComplete';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Theme';
import { Typography } from '@/constants/Typography';
import { AlertCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

type Suggestion = {
  placeId: string;
  text: string;
  secondaryText: string;
};

type Props = {
  onPlaceSelected: (place: PlaceDetail) => void;
  error?: string;
  prefillValue?: string;
  label?: string;
};

export const PlacesAutocompleteField = (props: Props) => {
  const { onPlaceSelected, error, prefillValue, label = 'Location' } = props;
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (prefillValue) {
      setInputValue(prefillValue);
      setDebouncedQuery('');
    }
  }, [prefillValue]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { data, isLoading: isFetchingSuggestions } = useAutoComplete(debouncedQuery);

  const suggestions: Suggestion[] =
    debouncedQuery.length >= 2
      ? (data?.suggestions ?? []).map((s: any) => ({
          placeId: s.placePrediction?.placeId ?? '',
          text: s.placePrediction?.structuredFormat?.mainText?.text ?? s.placePrediction?.text?.text ?? '',
          secondaryText: s.placePrediction?.structuredFormat?.secondaryText?.text ?? '',
        })).filter((s: Suggestion) => s.placeId)
      : [];

  const handleChangeText = (text: string) => {
    setInputValue(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length >= 2) {
      debounceRef.current = setTimeout(() => setDebouncedQuery(text.trim()), 400);
    } else {
      setDebouncedQuery('');
    }
  };

  const handleSelect = async (suggestion: Suggestion) => {
    setInputValue(suggestion.text);
    setDebouncedQuery('');
    setIsLoadingDetails(true);
    try {
      const detail = await googleApi.getPlaceDetails(suggestion.placeId);
      onPlaceSelected(detail);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const showDropdown = suggestions.length > 0 && !isLoadingDetails;
  const isActive = !!error || isFocused;
  const borderColor = error
    ? theme.error
    : isFocused
      ? theme.accent
      : theme.border;
  const showSpinner = isFetchingSuggestions || isLoadingDetails;

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.row,
          { borderBottomColor: borderColor, borderBottomWidth: isActive ? 2 : 1 },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search address or place name"
          placeholderTextColor={theme.textMuted}
          value={inputValue}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {showSpinner ? (
          <ActivityIndicator
            size="small"
            color={theme.accent}
            style={styles.trailingIcon}
          />
        ) : null}

        {error ? (
          <AlertCircle size={18} color={theme.error} style={styles.trailingIcon} />
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      ) : null}

      {showDropdown ? (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.suggestionRow,
                  index < suggestions.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.border,
                  },
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.suggestionMain, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.text}
                </Text>
                {item.secondaryText ? (
                  <Text
                    style={[styles.suggestionSecondary, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.secondaryText}
                  </Text>
                ) : null}
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.space2,
  },
  label: {
    ...Typography.label,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.space2,
  },
  input: {
    ...Typography.body,
    flex: 1,
    padding: 0,
  },
  trailingIcon: {
    marginLeft: Spacing.space2,
  },
  error: {
    ...Typography.secondary,
  },
  dropdown: {
    marginTop: Spacing.space1,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionMain: {
    ...Typography.body,
  },
  suggestionSecondary: {
    ...Typography.secondary,
    marginTop: 1,
  },
});
