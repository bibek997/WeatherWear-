import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { toEmoji } from '../utils/emojiHelper';
import { Ionicons } from '@expo/vector-icons';

export default function OutfitCard({ day, onPress }) {
  const em = (piece) => toEmoji(day.outfit[piece]);

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain')) return 'rainy';
    if (conditionLower.includes('cloud')) return 'cloudy';
    if (conditionLower.includes('snow')) return 'snow';
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) return 'sunny';
    return 'partly-sunny';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.dateSection}>
          <Text style={styles.day}>{day.day}</Text>
          <Text style={styles.date}>{day.date}</Text>
        </View>
        
        <View style={styles.weatherSection}>
          <Ionicons 
            name={getWeatherIcon(day.condition)} 
            size={24} 
            color="#007AFF" 
          />
          <View style={styles.tempContainer}>
            <Text style={styles.highTemp}>{day.high}°</Text>
            <Text style={styles.lowTemp}>/{day.low}°</Text>
          </View>
        </View>
      </View>

      {/* Condition */}
      <Text style={styles.condition}>{day.condition}</Text>

      {/* Outfit Grid */}
      <View style={styles.outfitGrid}>
        {[
          { key: 'topwear', label: 'Top' },
          { key: 'bottomwear', label: 'Bottom' },
          { key: 'footwear', label: 'Shoes' },
          { key: 'accessory', label: 'Accessory' }
        ].map((item) => (
          <View key={item.key} style={styles.outfitItem}>
            <Text style={styles.emoji}>{em(item.key)}</Text>
            <Text style={styles.outfitLabel}>{item.label}</Text>
            <Text style={styles.outfitName} numberOfLines={1}>
              {day.outfit[item.key]}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer with Unit */}
      <View style={styles.footer}>
        <Text style={styles.unit}>{day.unit.toUpperCase()}</Text>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateSection: {
    flex: 1,
  },
  day: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  weatherSection: {
    alignItems: 'flex-end',
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  highTemp: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  lowTemp: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  condition: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  outfitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  outfitItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  outfitLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  outfitName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  unit: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});