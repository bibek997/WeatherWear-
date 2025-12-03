// import React, { useEffect, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   ActivityIndicator, 
//   TouchableOpacity,
//   RefreshControl,
//   Alert
// } from 'react-native';
// import axios from 'axios';
// import { API_BASE } from '../../constants';
// import { toEmoji } from '../utils/emojiHelper';
// import OutfitCard from '../components/OutfitCard';
// import { Ionicons } from '@expo/vector-icons';

// export default function HomeScreen({ route, navigation }) {
//   const { location, unit, gender } = route.params;
//   const [today, setToday] = useState(null);
//   const [forecast, setForecast] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchData = async () => {
//     try {
//       const [t, f] = await Promise.all([
//         axios.get(`${API_BASE}/outfit/${location}?gender=${gender}&unit=${unit}`),
//         axios.get(`${API_BASE}/forecast/${location}?gender=${gender}&unit=${unit}`),
//       ]);
//       setToday(t.data);
//       setForecast(f.data);
//     } catch (e) {
//       Alert.alert('Connection Error', 'Unable to fetch weather data. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchData();
//   };

//   useEffect(() => { 
//     fetchData(); 
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.loadingText}>Getting your outfit recommendations...</Text>
//       </View>
//     );
//   }

//   const em = (piece) => toEmoji(today.outfit[piece]);

//   const getWeatherIcon = (condition) => {
//     const conditionLower = condition?.toLowerCase() || '';
//     if (conditionLower.includes('rain')) return 'rainy';
//     if (conditionLower.includes('cloud')) return 'cloudy';
//     if (conditionLower.includes('snow')) return 'snow';
//     if (conditionLower.includes('sun') || conditionLower.includes('clear')) return 'sunny';
//     return 'partly-sunny';
//   };

//   return (
//     <ScrollView 
//       style={styles.container}
//       contentContainerStyle={styles.contentContainer}
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={onRefresh}
//           tintColor="#007AFF"
//         />
//       }
//       showsVerticalScrollIndicator={false}
//     >
//       {/* Header Section */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.location}>{location}</Text>
//           <Text style={styles.unit}>°{unit.toUpperCase()}</Text>
//         </View>
//         <TouchableOpacity 
//           style={styles.settingsButton}
//           onPress={() => navigation.navigate('Settings', { location, unit, gender })}
//         >
//           <Ionicons name="settings-outline" size={24} color="#666" />
//         </TouchableOpacity>
//       </View>

//       {/* Current Weather Card */}
//       <View style={styles.weatherCard}>
//         <View style={styles.weatherHeader}>
//           <View>
//             <Text style={styles.temperature}>{today.temp}°</Text>
//             <Text style={styles.condition}>{today.condition}</Text>
//           </View>
//           <Ionicons 
//             name={getWeatherIcon(today.condition)} 
//             size={64} 
//             color="#007AFF" 
//           />
//         </View>
        
//         <View style={styles.weatherMetrics}>
//           <View style={styles.metricItem}>
//             <Ionicons name="water-outline" size={20} color="#007AFF" />
//             <Text style={styles.metricText}>Humidity</Text>
//             <Text style={styles.metricValue}>{today.humidity}%</Text>
//           </View>
//           <View style={styles.metricItem}>
//             <Ionicons name="speedometer-outline" size={20} color="#007AFF" />
//             <Text style={styles.metricText}>Wind</Text>
//             <Text style={styles.metricValue}>{today.wind ?? 0} m/s</Text>
//           </View>
//         </View>
//       </View>

//       {/* Today's Outfit Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Today's Outfit</Text>
//         <View style={styles.outfitCard}>
//           <View style={styles.outfitGrid}>
//             {[
//               { key: 'topwear', label: 'Top' },
//               { key: 'bottomwear', label: 'Bottom' },
//               { key: 'footwear', label: 'Shoes' },
//               { key: 'accessory', label: 'Accessory' }
//             ].map((item) => (
//               <View key={item.key} style={styles.outfitItem}>
//                 <Text style={styles.outfitEmoji}>{em(item.key)}</Text>
//                 <Text style={styles.outfitLabel}>{item.label}</Text>
//                 <Text style={styles.outfitName} numberOfLines={2}>
//                   {today.outfit[item.key]}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>
//       </View>

//       {/* Style Tip */}
//       {today.tip && (
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Style Tip</Text>
//           <View style={styles.tipCard}>
//             <Ionicons name="sparkles" size={20} color="#B45309" style={styles.tipIcon} />
//             <Text style={styles.tipText}>{today.tip}</Text>
//           </View>
//         </View>
//       )}

//       {/* Forecast Section */}
//       <View style={styles.section}>
//         <View style={styles.forecastHeader}>
//           <Text style={styles.sectionTitle}>3-Day Forecast</Text>
//           <Text style={styles.forecastSubtitle}>Swipe for details</Text>
//         </View>
//         {forecast.map((day, index) => (
//           <OutfitCard 
//             key={day.day} 
//             day={day} 
//             onPress={() => Alert.alert(`Style Tip for ${day.day}`, day.tip)}
//             isFirst={index === 0}
//           />
//         ))}
//       </View>

//       {/* Refresh Button */}
//       <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
//         <Ionicons name="refresh" size={20} color="#007AFF" />
//         <Text style={styles.refreshText}>Refresh Data</Text>
//       </TouchableOpacity>

//       <View style={styles.bottomSpacer} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   contentContainer: {
//     paddingBottom: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F9FA',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//     fontWeight: '500',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 20,
//   },
//   location: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   unit: {
//     fontSize: 16,
//     color: '#007AFF',
//     fontWeight: '600',
//     marginTop: 4,
//   },
//   settingsButton: {
//     padding: 8,
//   },
//   weatherCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 20,
//     borderRadius: 20,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//     marginBottom: 8,
//   },
//   weatherHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   temperature: {
//     fontSize: 48,
//     fontWeight: '700',
//     color: '#1A1A1A',
//   },
//   condition: {
//     fontSize: 18,
//     color: '#666',
//     fontWeight: '600',
//     marginTop: 4,
//     textTransform: 'capitalize',
//   },
//   weatherMetrics: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//     paddingTop: 20,
//   },
//   metricItem: {
//     alignItems: 'center',
//   },
//   metricText: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   metricValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginTop: 2,
//   },
//   section: {
//     marginTop: 24,
//     paddingHorizontal: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1A1A1A',
//     marginBottom: 12,
//   },
//   forecastHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//     marginBottom: 12,
//   },
//   forecastSubtitle: {
//     fontSize: 12,
//     color: '#666',
//     fontWeight: '500',
//   },
//   outfitCard: {
//     backgroundColor: '#E3F2FD',
//     borderRadius: 16,
//     padding: 20,
//   },
//   outfitGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   outfitItem: {
//     alignItems: 'center',
//     flex: 1,
//     paddingHorizontal: 8,
//   },
//   outfitEmoji: {
//     fontSize: 28,
//     marginBottom: 8,
//   },
//   outfitLabel: {
//     fontSize: 12,
//     color: '#007AFF',
//     fontWeight: '600',
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   outfitName: {
//     fontSize: 11,
//     color: '#1A1A1A',
//     textAlign: 'center',
//     fontWeight: '500',
//     lineHeight: 14,
//   },
//   tipCard: {
//     backgroundColor: '#FFFBEB',
//     borderRadius: 16,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     borderLeftWidth: 4,
//     borderLeftColor: '#F59E0B',
//   },
//   tipIcon: {
//     marginRight: 12,
//     marginTop: 2,
//   },
//   tipText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#B45309',
//     fontWeight: '500',
//     lineHeight: 20,
//     fontStyle: 'italic',
//   },
//   refreshButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FFF',
//     marginHorizontal: 20,
//     marginTop: 24,
//     paddingVertical: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E1E5E9',
//   },
//   refreshText: {
//     color: '#007AFF',
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   bottomSpacer: {
//     height: 20,
//   },
// });

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
  const { location, unit, gender } = route.params;
  const [today, setToday] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [t, f] = await Promise.all([
        axios.get(`${API_BASE}/outfit/${location}?gender=${gender}&unit=${unit}`),
        axios.get(`${API_BASE}/forecast/${location}?gender=${gender}&unit=${unit}`),
      ]);
      setToday(t.data);
      setForecast(f.data);
    } catch (e) {
      Alert.alert('Connection Error', 'Unable to fetch weather data. Please check your connection and try again.');
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

  // ---------- GUARD: still loading OR first render ----------
  if (loading || !today) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your outfit recommendations...</Text>
      </View>
    );
  }

  // ---------- everything below is safe ----------
  const em = (piece) => toEmoji(today.outfit[piece]);

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain')) return 'rainy';
    if (conditionLower.includes('cloud')) return 'cloudy';
    if (conditionLower.includes('snow')) return 'snow';
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) return 'sunny';
    return 'partly-sunny';
  };

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
      {/* Header Section */}
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

      {/* Current Weather Card */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <View>
            <Text style={styles.temperature}>{today.temp}°</Text>
            <Text style={styles.condition}>{today.condition}</Text>
          </View>
          <Ionicons 
            name={getWeatherIcon(today.condition)} 
            size={64} 
            color="#007AFF" 
          />
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
            <Text style={styles.metricValue}>{today.wind ?? 0} m/s</Text>
          </View>
        </View>
      </View>

      {/* Today's Outfit Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Outfit</Text>
        <View style={styles.outfitCard}>
          <View style={styles.outfitGrid}>
            {[
              { key: 'topwear', label: 'Top' },
              { key: 'bottomwear', label: 'Bottom' },
              { key: 'footwear', label: 'Shoes' },
              { key: 'accessory', label: 'Accessory' }
            ].map((item) => (
              <View key={item.key} style={styles.outfitItem}>
                <Text style={styles.outfitEmoji}>{em(item.key)}</Text>
                <Text style={styles.outfitLabel}>{item.label}</Text>
                <Text style={styles.outfitName} numberOfLines={2}>
                  {today.outfit[item.key]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Style Tip */}
      {today.tip && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Tip</Text>
          <View style={styles.tipCard}>
            <Ionicons name="sparkles" size={20} color="#B45309" style={styles.tipIcon} />
            <Text style={styles.tipText}>{today.tip}</Text>
          </View>
        </View>
      )}

      {/* Forecast Section */}
      <View style={styles.section}>
        <View style={styles.forecastHeader}>
          <Text style={styles.sectionTitle}>3-Day Forecast</Text>
          <Text style={styles.forecastSubtitle}>Swipe for details</Text>
        </View>
        {forecast.map((day, index) => (
          <OutfitCard 
            key={day.day} 
            day={day} 
            onPress={() => Alert.alert(`Style Tip for ${day.day}`, day.tip)}
            isFirst={index === 0}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  location: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  unit: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  weatherCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 8,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  condition: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  weatherMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  forecastSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  outfitCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
  },
  outfitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outfitItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  outfitEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  outfitLabel: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  outfitName: {
    fontSize: 11,
    color: '#1A1A1A',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#B45309',
    fontWeight: '500',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  refreshText: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});