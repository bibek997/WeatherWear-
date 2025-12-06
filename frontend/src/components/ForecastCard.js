import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toEmoji } from '../utils/emojiHelper';

const ForecastCard = ({ day, unit, index, onPress, getWeatherIcon, getHeaderColor }) => {
  const dayEm = (piece) => toEmoji(day.outfit[piece] || '');
  const cardHeaderColor = getHeaderColor(day.condition);

  return (
    <TouchableOpacity
      style={styles.forecastCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.forecastCardHeader, { backgroundColor: cardHeaderColor }]}>
        <View style={styles.forecastHeaderTop}>
          <View>
            <Text style={styles.forecastDay}>{index === 0 ? 'Tomorrow' : day.day}</Text>
            <Text style={styles.forecastDate}>{day.date}</Text>
          </View>
          
          <View style={styles.forecastTempSection}>
            <Text style={styles.forecastTemp}>{Math.round(day.temp)}°{unit}</Text>
            <Text style={styles.forecastFeelsLikeSmall}>Feels like {Math.round(day.feels_like)}°</Text>
          </View>
        </View>
        
        <View style={styles.forecastHeaderBottom}>
          <View style={styles.forecastWeatherInfo}>
            <View style={styles.forecastIconContainer}>
              <Ionicons name={getWeatherIcon(day.condition)} size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.forecastCondition}>{day.condition}</Text>
          </View>
          
          <View style={styles.forecastMetrics}>
            <View style={styles.forecastMetricItem}>
              <Ionicons name="water-outline" size={14} color="#FFFFFF" />
              <Text style={styles.forecastMetricText}>{day.humidity}%</Text>
            </View>
            <View style={styles.forecastMetricItem}>
              <Ionicons name="speedometer-outline" size={14} color="#FFFFFF" />
              <Text style={styles.forecastMetricText}>{day.wind_speed} m/s</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.forecastCardBody}>
        <Text style={styles.forecastOutfitTitle}>Recommended Outfit</Text>
        
        <View style={styles.forecastOutfitGrid}>
          {['top', 'bottom', 'footwear', 'accessory'].map((piece) => (
            <View key={piece} style={styles.forecastOutfitItem}>
              <View style={styles.forecastEmojiContainer}>
                <Text style={styles.forecastEmoji}>{dayEm(piece)}</Text>
              </View>
              <Text style={styles.forecastOutfitLabel}>
                {piece.charAt(0).toUpperCase() + piece.slice(1)}
              </Text>
              <Text style={styles.forecastOutfitName} numberOfLines={2}>
                {day.outfit[piece]}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.forecastCardFooter}>
        <Text style={styles.viewDetailsText}>Tap for full details</Text>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  forecastCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  forecastCardHeader: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  forecastHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  forecastDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  forecastDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  forecastTempSection: {
    alignItems: 'flex-end',
  },
  forecastTemp: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  forecastFeelsLikeSmall: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  forecastHeaderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastWeatherInfo: {
    alignItems: 'center',
  },
  forecastIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 6,
  },
  forecastCondition: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  forecastMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  forecastMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  forecastMetricText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  forecastCardBody: {
    padding: 20,
  },
  forecastOutfitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 16,
  },
  forecastOutfitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  forecastOutfitItem: {
    alignItems: 'center',
    width: '22%', 
    marginBottom: 8,
  },
  forecastEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  forecastEmoji: {
    fontSize: 24,
  },
  forecastOutfitLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  forecastOutfitName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    lineHeight: 16,
  },
  forecastCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
    fontWeight: '500',
  },
});

export default ForecastCard;