import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SetupScreen({ navigation }) {
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('C');
  const [gender, setGender] = useState('male');
  const [isLoading, setIsLoading] = useState(false);

  const getLocationGPS = async () => {
    setIsLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { 
      Alert.alert('Permission Denied', 'Location permission is required to get accurate weather data.'); 
      setIsLoading(false);
      return; 
    }
    
    try {
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      let geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo.length) {
        setLocation(geo[0].city || geo[0].name || 'Unknown');
      }
    } catch (error) {
      Alert.alert('Location Error', 'Unable to fetch your current location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAndProceed = async () => {
    if (!location.trim()) { 
      Alert.alert('Location Required', 'Please enter your location to get personalized recommendations.'); 
      return; 
    }
    
    setIsLoading(true);
    try {
      const payload = { location: location.trim(), unit, gender };
      await AsyncStorage.setItem('userSetup', JSON.stringify(payload));

      // Add a small delay for smooth transition
      setTimeout(() => {
        navigation.replace('Home', payload);
      }, 300);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="partly-sunny" size={36} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.title}>WeatherWear</Text>
          </View>
          
          {/* Single Card Container */}
          <View style={styles.mainCard}>
            
            {/* Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Location</Text>
              <View style={styles.locationContainer}>
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholder="Enter city name"
                      value={location}
                      onChangeText={setLocation}
                      style={styles.input}
                      placeholderTextColor="#8E8E93"
                      autoCapitalize="words"
                      returnKeyType="done"
                    />
                  </View>
                  <TouchableOpacity 
                    style={[styles.gpsButton, isLoading && styles.gpsButtonDisabled]}
                    onPress={getLocationGPS}
                    disabled={isLoading}
                  >
                    <Ionicons 
                      name={isLoading ? "sync" : "navigate"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Temperature Unit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Temperature Scale</Text>
              <View style={styles.optionsContainer}>
                {[
                  { value: 'C', label: 'Celsius' },
                  { value: 'F', label: 'Fahrenheit' }
                ].map((item) => (
                  <TouchableOpacity 
                    key={item.value}
                    onPress={() => setUnit(item.value)}
                    style={[
                      styles.optionCard,
                      unit === item.value && styles.optionCardActive
                    ]}
                  >
                    <Text style={[
                      styles.optionText,
                      unit === item.value && styles.optionTextActive
                    ]}>
                      °{item.value}
                    </Text>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Wardrobe Preference */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wardrobe Style</Text> 
              <View style={styles.genderOptionsContainer}>
                {[
                  { value: 'male', label: 'Men' },
                  { value: 'female', label: 'Women' },
                  { value: 'baby', label: 'Kids' }
                ].map((item) => (
                  <TouchableOpacity 
                    key={item.value}
                    onPress={() => setGender(item.value)}
                    style={[
                      styles.genderCard,
                      gender === item.value && styles.genderCardActive
                    ]}
                  >
                    <Text style={[
                      styles.genderText,
                      gender === item.value && styles.genderTextActive
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
            onPress={saveAndProceed}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.continueButtonContent}>
              <Text style={styles.continueButtonText}>
                {isLoading ? 'Setting Up...' : 'Get Started'}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 80,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  section: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 14,
  },
  locationContainer: {
    marginTop: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    height: '100%',
  },
  gpsButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 80,
  },
  optionCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  optionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 2,
  },
  optionTextActive: {
    color: '#007AFF',
  },
  optionLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  genderOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 48,
  },
  genderCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  genderTextActive: {
    color: '#007AFF',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    marginTop: 14,
    marginBottom: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  continueButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#8E8E93',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});