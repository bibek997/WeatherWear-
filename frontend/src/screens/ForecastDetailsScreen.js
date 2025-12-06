import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toEmoji } from '../utils/emojiHelper';

const { width } = Dimensions.get('window');

export default function ForecastDetails({ route }) {
  const { day, unit } = route.params;

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

  const headerColor = getHeaderColor(day.condition);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Compact header */}
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <View style={styles.headerContent}>
            <View style={styles.dateRow}>
              <Text style={styles.day}>{day.day}</Text>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{day.date}</Text>
              </View>
            </View>
            
            <View style={styles.weatherRow}>
              <View style={styles.weatherIconContainer}>
                <View style={styles.iconBackground}>
                  <Ionicons name={getWeatherIcon(day.condition)} size={56} color="#FFFFFF" />
                </View>
              </View>
              
              <View style={styles.tempContainer}>
                <Text style={styles.temp}>{Math.round(day.temp)}°{unit}</Text>
                <Text style={styles.condition}>{day.condition}</Text>
                <Text style={styles.feelsLike}>Feels like {Math.round(day.feels_like)}°{unit}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weather metrics cards */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Weather Details</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="water-outline" size={24} color="#1976D2" />
              </View>
              <Text style={styles.metricValue}>{day.humidity}%</Text>
              <Text style={styles.metricLabel}>Humidity</Text>
            </View>
            
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="speedometer-outline" size={24} color="#7B1FA2" />
              </View>
              <Text style={styles.metricValue}>{day.wind_speed} m/s</Text>
              <Text style={styles.metricLabel}>Wind Speed</Text>
            </View>
            
            {day.rain && (
              <View style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="rainy-outline" size={24} color="#388E3C" />
                </View>
                <Text style={styles.metricValue}>{day.rain}mm</Text>
                <Text style={styles.metricLabel}>Rain</Text>
              </View>
            )}
          </View>
        </View>

        {/* Outfit recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shirt-outline" size={24} color="#424242" />
            <Text style={styles.sectionTitle}>Outfit Recommendations</Text>
          </View>
          
          <View style={styles.outfitGrid}>
            {['top', 'bottom', 'footwear', 'accessory'].map((piece) => (
              <View key={piece} style={styles.outfitCard}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{toEmoji(day.outfit[piece])}</Text>
                </View>
                <Text style={styles.outfitLabel}>
                  {piece.charAt(0).toUpperCase() + piece.slice(1)}
                </Text>
                <Text style={styles.outfitName} numberOfLines={2}>
                  {day.outfit[piece]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        {day.outfit.tips?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={24} color="#424242" />
              <Text style={styles.sectionTitle}>Style Tips</Text>
            </View>
            
            <View style={styles.tipsContainer}>
              {day.outfit.tips.map((tip, idx) => (
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

        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 50,
    paddingBottom:40,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  day: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 10,
  },
  dateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherIconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tempContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  temp: {
    fontSize: 50,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  condition: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  feelsLike: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  metricsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 3,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginLeft: 10,
  },
  outfitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  emoji: {
    fontSize: 28,
  },
  outfitLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  outfitName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    lineHeight: 17,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipBullet: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  footerSpace: {
    height: 30,
  },
});