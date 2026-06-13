import googleApi, { PlaceDetail } from '@/lib/services/google';
import { useAutoComplete } from '@/hooks/useAutoComplete';
import { Colors } from '@/constants/Colors';
import { FontFamily, Typography } from '@/constants/Typography';
import React, { useRef, useState } from 'react';
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
};

export const PlacesAutocompleteField = (props: Props) => {
  const { onPlaceSelected, error } = props;
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { data, isLoading } = useAutoComplete(debouncedQuery);

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

  return (
    <View>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? '#D94F3D' : theme.border,
            backgroundColor: theme.surface,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search address or place name"
          placeholderTextColor={theme.textSecondary}
          value={inputValue}
          onChangeText={handleChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {(isLoading || isLoadingDetails) && (
          <ActivityIndicator
            size="small"
            color={theme.accent}
            style={styles.spinner}
          />
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {showDropdown && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    paddingVertical: 14,
  },
  spinner: {
    marginLeft: 8,
  },
  errorText: {
    ...Typography.secondary,
    color: '#D94F3D',
    marginTop: 4,
    marginLeft: 4,
  },
  dropdown: {
    marginTop: 4,
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
