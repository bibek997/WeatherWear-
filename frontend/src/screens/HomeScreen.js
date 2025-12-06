import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import axios from 'axios';
import { API_BASE } from '../../constants';
import { toEmoji } from '../utils/emojiHelper';
import OutfitCard from '../components/OutfitCard';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ route, navigation }) {
  const { location, unit: u, gender } = route.params;

  const [today, setToday] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // -----------------------------
  // Fetch Today + Forecast
  // -----------------------------
  const fetchData = async () => {
    try {
      setLoading(true);

      const [t, f] = await Promise.all([
        axios.get(`${API_BASE}/outfit/${location}`, { params: { gender, unit: u } }),
        axios.get(`${API_BASE}/forecast/${location}`, { params: { gender, unit: u } }),
      ]);

      setToday(t.data);

      // FIX: forecast array extraction
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

  const getWeatherIcon = (condition) => {
    const c = condition?.toLowerCase() || '';
    if (c.includes('rain')) return 'rainy';
    if (c.includes('cloud')) return 'cloudy';
    if (c.includes('snow')) return 'snow';
    if (c.includes('sun') || c.includes('clear')) return 'sunny';
    return 'partly-sunny';
  };

  // -----------------------------
  // MAIN UI
  // -----------------------------
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.location}>{location}</Text>
          <Text style={styles.unit}>°{unit.toUpperCase()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings', { location, unit, gender })}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Today's Weather */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <View>
            <Text style={styles.temperature}>{today.temperature}°</Text>
            <Text style={styles.condition}>{today.weather_condition}</Text>
          </View>
          <Ionicons name={getWeatherIcon(today.weather_condition)} size={64} color="#007AFF" />
        </View>

        <View style={styles.weatherMetrics}>
          <View style={styles.metricItem}>
            <Ionicons name="water-outline" size={20} color="#007AFF" />
            <Text style={styles.metricText}>Humidity</Text>
            <Text style={styles.metricValue}>{today.humidity}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="speedometer-outline" size={20} color="#007AFF" />
            <Text style={styles.metricText}>Wind</Text>
            <Text style={styles.metricValue}>{today.wind_speed ?? 0} m/s</Text>
          </View>
        </View>
      </View>

      {/* Today's Outfit */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Outfit</Text>
        <View style={styles.outfitCard}>
          <View style={styles.outfitGrid}>
            {['top', 'bottom', 'footwear', 'accessory'].map((key) => (
              <View key={key} style={styles.outfitItem}>
                <Text style={styles.outfitEmoji}>{em(key)}</Text>
                <Text style={styles.outfitLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <Text style={styles.outfitName} numberOfLines={2}>
                  {today.outfit[key] || '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Tips */}
      {today.outfit.tips && today.outfit.tips.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Tip</Text>
          <View style={styles.tipCard}>
            <Ionicons name="sparkles" size={20} color="#B45309" style={styles.tipIcon} />
            <Text style={styles.tipText}>{today.outfit.tips.join('\n')}</Text>
          </View>
        </View>
      )}

      {/* 3-Day Forecast */}
      <View style={styles.section}>
        <View style={styles.forecastHeader}>
          <Text style={styles.sectionTitle}>3-Day Forecast</Text>
          <Text style={styles.forecastSubtitle}>Swipe for details</Text>
        </View>

        {forecast.map((day) => (
          <OutfitCard 
            key={day.date}
            day={day}
            unit={unit}
            onPress={() => Alert.alert(`Style Tip for ${day.day}`, day.tip?.join('\n') || '')}
          />
        ))}
      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
        <Ionicons name="refresh" size={20} color="#007AFF" />
        <Text style={styles.refreshText}>Refresh Data</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

//
// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  contentContainer: { paddingBottom: 20 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666', fontWeight: '500' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  location: { fontSize: 28, fontWeight: '700', color: '#1A1A1A' },
  unit: { fontSize: 16, color: '#007AFF', fontWeight: '600', marginTop: 4 },
  settingsButton: { padding: 8 },

  weatherCard: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20, padding: 24, elevation: 5, marginBottom: 8 },
  weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  temperature: { fontSize: 48, fontWeight: '700', color: '#1A1A1A' },
  condition: { fontSize: 18, color: '#666', fontWeight: '600' },

  weatherMetrics: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 20 },
  metricItem: { alignItems: 'center' },
  metricText: { fontSize: 12, color: '#666' },
  metricValue: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  forecastHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  forecastSubtitle: { fontSize: 12, color: '#666' },

  outfitCard: { backgroundColor: '#E3F2FD', borderRadius: 16, padding: 20 },
  outfitGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  outfitItem: { alignItems: 'center', flex: 1, paddingHorizontal: 8 },
  outfitEmoji: { fontSize: 28, marginBottom: 8 },
  outfitLabel: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  outfitName: { fontSize: 11, color: '#1A1A1A', textAlign: 'center' },

  tipCard: { backgroundColor: '#FFFBEB', borderLeftWidth: 4, borderLeftColor: '#F59E0B', borderRadius: 16, padding: 16, flexDirection: 'row' },
  tipIcon: { marginRight: 12 },
  tipText: { flex: 1, color: '#B45309', fontStyle: 'italic' },

  refreshButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 24, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E1E5E9' },
  refreshText: { color: '#007AFF', marginLeft: 8, fontWeight: '600' },

  bottomSpacer: { height: 20 },
});
