import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { FontFamily, Typography } from '@/constants/Typography';
import { useCities } from '@/hooks/useCities';
import { CityWithCount } from '@/types';

const GAP = 12;
const PADDING = 16;
const CARD_WIDTH = (Dimensions.get('window').width - PADDING * 2 - GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

const CITY_GRADIENTS: [string, string][] = [
  ['#C4572A', '#E8965A'],
  ['#5B7FA8', '#A8C5D8'],
  ['#4A7C59', '#85B89A'],
  ['#8B6FAD', '#C4A8E0'],
  ['#8B5E3C', '#C49060'],
  ['#2D3A5E', '#5B7FA8'],
];

function gradientForName(name: string): [string, string] {
  if (!name) return CITY_GRADIENTS[0];
  return CITY_GRADIENTS[name.charCodeAt(0) % CITY_GRADIENTS.length];
}

// ── City Card ──────────────────────────────────────────────────────────────

type CityCardProps = {
  city: CityWithCount;
  onPress: () => void;
};

const CityCard = (props: CityCardProps) => {
  const { city, onPress } = props;
  const gradient = gradientForName(city.name);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {city.imageUrl ? (
        <Image
          source={{ uri: city.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={[StyleSheet.absoluteFill, styles.cardOverlay]}
      >
        <View style={styles.cardBottom}>
          <Text style={styles.cardName} numberOfLines={2}>
            {city.name}
          </Text>
          {city.spotCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{city.spotCount}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ── Skeleton Card ──────────────────────────────────────────────────────────

type SkeletonCardProps = { theme: typeof Colors.light };

const SkeletonCard = (props: SkeletonCardProps) => {
  const { theme } = props;
  return <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]} />;
};

// ── Onboarding Empty State ─────────────────────────────────────────────────

type OnboardingEmptyProps = {
  theme: typeof Colors.light;
  onAdd: () => void;
};

const OnboardingEmpty = (props: OnboardingEmptyProps) => {
  const { theme, onAdd } = props;
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrapper, { backgroundColor: theme.accentSubtle }]}>
        <IconSymbol name="mappin.and.ellipse" size={36} color={theme.accent} />
      </View>
      <Text style={[Typography.title, styles.emptyTitle, { color: theme.text }]}>
        Add your first city
      </Text>
      <Text style={[Typography.body, styles.emptyBody, { color: theme.textSecondary }]}>
        Collect places you love — cafés, restaurants, hidden gems — organized by city.
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: theme.accent }]}
        onPress={onAdd}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyButtonText}>Add a city</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Screen ─────────────────────────────────────────────────────────────────

export default function CitiesScreen() {
  const { cities, isLoading } = useCities();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const handleAdd = () => router.push('/cities/create');

  const handleCityPress = (city: CityWithCount) => {
    router.push({
      pathname: '/cities/[cityid]',
      params: { cityid: city.id, cityName: city.name },
    });
  };

  const isEmpty = !isLoading && (!cities || cities.length === 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Header — hidden during onboarding so the empty state fills the screen */}
      {!isEmpty && (
        <View style={styles.header}>
          <Text style={[Typography.title, { color: theme.text }]}>My Cities</Text>
          <TouchableOpacity onPress={handleAdd} hitSlop={8}>
            <IconSymbol name="plus" size={22} color={theme.accent} />
          </TouchableOpacity>
        </View>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <View style={styles.skeletonGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <SkeletonCard theme={theme} />
              <SkeletonCard theme={theme} />
            </View>
          ))}
        </View>
      )}

      {/* Onboarding */}
      {isEmpty && <OnboardingEmpty theme={theme} onAdd={handleAdd} />}

      {/* 2-column city grid */}
      {!isLoading && cities && cities.length > 0 && (
        <FlatList
          data={cities}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <CityCard city={item} onPress={() => handleCityPress(item)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    paddingTop: 16,
    paddingBottom: 12,
  },
  gridContent: {
    padding: PADDING,
  },
  gridRow: {
    gap: GAP,
    marginBottom: GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardOverlay: {
    justifyContent: 'flex-end',
    padding: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  cardName: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 26,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: 11,
  },
  skeletonGrid: {
    padding: PADDING,
    gap: GAP,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyBody: {
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: 16,
  },
});
