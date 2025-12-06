import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SetupScreen({ navigation }) {
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('C');
  const [gender, setGender] = useState('male');

  const getLocationGPS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { 
      Alert.alert('Permission Denied', 'Location permission is required.'); 
      return; 
    }
    
    try {
      let loc = await Location.getCurrentPositionAsync({});
      let geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo.length) setLocation(geo[0].city || geo[0].name || 'Unknown');
    } catch (error) {
      Alert.alert('Location Error', 'Unable to fetch your current location.');
    }
  };

  const saveAndProceed = async () => {
    if (!location.trim()) { 
      Alert.alert('Location Required', 'Please enter your location.'); 
      return; 
    }
    
    try {
      const payload = { location: location.trim(), unit, gender };
      await AsyncStorage.setItem('userSetup', JSON.stringify(payload));

      // Navigate to HomeScreen with user setup
      navigation.replace('Home', payload);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="partly-sunny" size={32} color="#007AFF" />
          </View>
          <Text style={styles.title}>WeatherWear</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Location</Text>    
          <View style={styles.locationContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your city"
                value={location}
                onChangeText={setLocation}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.gpsButton} onPress={getLocationGPS}>
              <Ionicons name="navigate" size={18} color="#007AFF" />
              <Text style={styles.gpsButtonText}>Use GPS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Temperature Unit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Temperature Unit</Text>  
          <View style={styles.optionsContainer}>
            {['C', 'F'].map((item) => (
              <TouchableOpacity 
                key={item}
                onPress={() => setUnit(item)}
                style={[
                  styles.optionCard,
                  unit === item && styles.optionCardActive
                ]}
              >
                <Text style={[
                  styles.optionText,
                  unit === item && styles.optionTextActive
                ]}>
                  °{item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wardrobe Preference</Text>        
          <View style={styles.optionsContainer}>
            {['male','female','baby'].map((item) => (
              <TouchableOpacity 
                key={item}
                onPress={() => setGender(item)}
                style={[
                  styles.optionCard,
                  gender === item && styles.optionCardActive
                ]}
              >
                <Text style={[
                  styles.optionText,
                  gender === item && styles.optionTextActive
                ]}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={saveAndProceed}>
          <Text style={styles.continueButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 10 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E1E5E9', paddingHorizontal: 16, marginRight: 12, height: 52 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1A1A1A', height: '100%' },
  gpsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#007AFF' },
  gpsButtonText: { color: '#007AFF', fontWeight: '600', marginLeft: 6 },
  optionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  optionCard: { flex: 1, alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', marginHorizontal: 4, minHeight: 60, justifyContent: 'center' },
  optionCardActive: { borderColor: '#007AFF', backgroundColor: '#F0F7FF' },
  optionText: { fontSize: 16, fontWeight: '600', color: '#666' },
  optionTextActive: { color: '#007AFF' },
  continueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12 },
  continueButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600', marginRight: 8 },
});
