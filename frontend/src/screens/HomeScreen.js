import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
  Dimensions,
  StatusBar
} from 'react-native';
import axios from 'axios';
import { API_BASE } from '../../constants';
import { toEmoji } from '../utils/emojiHelper';
import { Ionicons } from '@expo/vector-icons';
import ForecastCard from '../components/ForecastCard'; 

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; 
const CARD_SPACING = 16;

export default function HomeScreen({ route, navigation }) {
  const { location, unit: u, gender } = route.params;

  const [today, setToday] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // -----------------------------
  // Fetch today + forecast
  // -----------------------------
  const fetchData = async () => {
    try {
      setLoading(true);

      const [t, f] = await Promise.all([
        axios.get(`${API_BASE}/outfit/${location}`, { params: { gender, unit: u } }),
        axios.get(`${API_BASE}/forecast/${location}`, { params: { gender, unit: u } }),
      ]);

      setToday(t.data);
      setForecast(f.data.forecasts || []);

    } catch (e) {
      console.log(e.message);
      Alert.alert('Connection Error', 'Unable to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const getWeatherIcon = (condition) => {
    const c = condition?.toLowerCase() || '';
    if (c.includes('rain')) return 'rainy';
    if (c.includes('cloud')) return 'cloudy';
    if (c.includes('snow')) return 'snow';
    if (c.includes('sun') || c.includes('clear')) return 'sunny';
    return 'partly-sunny';
  };

  const getHeaderColor = (condition) => {
    const c = condition?.toLowerCase() || '';
    if (c.includes('rain')) return '#4A6FA5';
    if (c.includes('cloud')) return '#5D8AA8';
    if (c.includes('snow')) return '#A8D0E6';
    if (c.includes('sun') || c.includes('clear')) return '#FFB347';
    return '#6A8EAE';
  };

  if (loading || !today) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your outfit recommendations...</Text>
      </View>
    );
  }

  const unit = u || 'C';
  const em = (piece) => toEmoji(today.outfit[piece] || '');
  const headerColor = getHeaderColor(today.weather_condition);

  // Handle scroll to track active card
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
    setActiveCardIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={headerColor} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top margin spacer */}
        <View style={styles.topMargin} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <View style={styles.headerContent}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={24} color="#FFFFFF" />
              <Text style={styles.location} numberOfLines={1}>
                {location}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <View style={styles.unitBadge}>
                <Text style={styles.unitText}>°{unit.toUpperCase()}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings', { location, unit, gender })}
                activeOpacity={0.6}
              >
                <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Today's Weather Card */}
        <View style={styles.todayWeatherCard}>
          <View style={styles.todayWeatherHeader}>
            <View style={styles.todayWeatherIconContainer}>
              <View style={[styles.todayIconBackground, { backgroundColor: `${headerColor}20` }]}>
                <Ionicons 
                  name={getWeatherIcon(today.weather_condition)} 
                  size={60} 
                  color={headerColor} 
                />
              </View>
            </View>
            
            <View style={styles.todayWeatherInfo}>
              <Text style={styles.todayTemperature}>{Math.round(today.temperature)}°{unit}</Text>
              <Text style={styles.todayCondition}>{today.weather_condition}</Text>
              <Text style={styles.todayFeelsLike}>Feels like {Math.round(today.feels_like)}°{unit}</Text>
            </View>
          </View>

          {/* Weather Metrics */}
          <View style={styles.todayMetricsGrid}>
            <View style={styles.todayMetricCard}>
              <View style={[styles.todayMetricIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="water-outline" size={24} color="#1976D2" />
              </View>
              <Text style={styles.todayMetricValue}>{today.humidity}%</Text>
              <Text style={styles.todayMetricLabel}>Humidity</Text>
            </View>
            
            <View style={styles.todayMetricCard}>
              <View style={[styles.todayMetricIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="speedometer-outline" size={24} color="#7B1FA2" />
              </View>
              <Text style={styles.todayMetricValue}>{today.wind_speed ?? 0} m/s</Text>
              <Text style={styles.todayMetricLabel}>Wind Speed</Text>
            </View>
            
            <View style={styles.todayMetricCard}>
              <View style={[styles.todayMetricIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="thermometer-outline" size={24} color="#FF9800" />
              </View>
              <Text style={styles.todayMetricValue}>{Math.round(today.temperature)}°</Text>
              <Text style={styles.todayMetricLabel}>Current Temp</Text>
            </View>
          </View>
        </View>

        {/* Today's Outfit */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shirt-outline" size={24} color="#424242" />
            <Text style={styles.sectionTitle}>Today's Outfit</Text>
          </View>
          
          <View style={styles.outfitGrid}>
            {['top', 'bottom', 'footwear', 'accessory'].map((key) => (
              <View key={key} style={styles.outfitCard}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{em(key)}</Text>
                </View>
                <Text style={styles.outfitLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text style={styles.outfitName} numberOfLines={2}>
                  {today.outfit[key] || '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        {today.outfit.tips && today.outfit.tips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={24} color="#424242" />
              <Text style={styles.sectionTitle}>Style Tips</Text>
            </View>
            
            <View style={styles.tipsContainer}>
              {today.outfit.tips.map((tip, idx) => (
                <View key={idx} style={styles.tipItem}>
                  <View style={styles.tipBullet}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3-Day Forecast Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color="#424242" />
            <View style={styles.forecastTitleContainer}>
              <Text style={styles.sectionTitle}>3-Day Forecast</Text>
              <View style={styles.carouselIndicators}>
                {forecast.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.indicatorDot,
                      index === activeCardIndex ? styles.indicatorDotActive : styles.indicatorDotInactive
                    ]} 
                  />
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {forecast.map((day, index) => (
                <View key={day.date} style={styles.carouselCardWrapper}>
                  <ForecastCard 
                    day={day}
                    unit={unit}
                    index={index}
                    onPress={() => navigation.navigate('ForecastDetails', { day, unit })}
                    getWeatherIcon={getWeatherIcon}
                    getHeaderColor={getHeaderColor}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
          
          <Text style={styles.carouselHint}>Swipe left or right to view more days</Text>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchData}
          activeOpacity={0.7}
        >
          <View style={styles.refreshIconContainer}>
            <Ionicons name="refresh" size={18} color="#007AFF" />
          </View>
          <Text style={styles.refreshText}>Refresh Data</Text>
        </TouchableOpacity>

        {/* Bottom margin spacer */}
        <View style={styles.bottomMargin} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  topMargin: {
    height: 15,
  },
  bottomMargin: {
    height: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingTop: 20,
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 15,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 12,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 6,
  },
  todayWeatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: -15,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  todayWeatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  todayWeatherIconContainer: {
    marginRight: 20,
  },
  todayIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  todayWeatherInfo: {
    flex: 1,
  },
  todayTemperature: {
    fontSize: 48,
    fontWeight: '300',
    color: '#212121',
    letterSpacing: -1,
  },
  todayCondition: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginTop: 4,
  },
  todayFeelsLike: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  todayMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
  },
  todayMetricCard: {
    alignItems: 'center',
    width: (width - 100) / 3,
  },
  todayMetricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  todayMetricLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginLeft: 12,
  },
  outfitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  emoji: {
    fontSize: 32,
  },
  outfitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  outfitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    lineHeight: 18,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
  },
  // Carousel Styles
  forecastTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  indicatorDotActive: {
    backgroundColor: '#007AFF',
    width: 12,
  },
  indicatorDotInactive: {
    backgroundColor: '#E0E0E0',
  },
  carouselContainer: {
    height: 435,
    marginBottom: 8,
  },
  carouselContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2 - CARD_SPACING,
    paddingVertical: 10,
  },
  carouselCardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  carouselHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 25,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  refreshIconContainer: {
    marginRight: 8,
  },
  refreshText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
