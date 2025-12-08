import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#08427c',
  background: '#F9F9F9',
  textPrimary: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#E74C3C',
  white: '#FFFFFF',
  success: '#4CAF50',
};

export default function SetupScreen({ navigation }) {
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('C');
  const [gender, setGender] = useState('male');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Fetch current location using GPS
  const getLocationGPS = async () => {
    setIsGettingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { 
        Alert.alert('Permission Denied', 'Location permission is required to get accurate weather data.'); 
        return; 
      }
      
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo.length) {
        setLocation(geo[0].city || geo[0].name || 'Unknown');
        Alert.alert(
          'Location Found',
          `Your location has been set to ${geo[0].city || geo[0].name || 'Unknown'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Location Error', 'Unable to fetch your current location. Please check your GPS and try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Save user setup and navigate
  const saveAndProceed = async () => {
    if (!location.trim()) { 
      Alert.alert('Location Required', 'Please enter your location to get personalized recommendations.'); 
      return; 
    }
    
    setIsLoading(true);
    try {
      const payload = { location: location.trim(), unit, gender };
      await AsyncStorage.setItem('userSetup', JSON.stringify(payload));

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
        style={{ flex: 1 }}
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
            <Text style={styles.headerTitle}>Setup Page</Text>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, location.trim() === '' && {borderColor: COLORS.error}]}>
                <TextInput
                  placeholder="Enter city name"
                  value={location}
                  onChangeText={setLocation}
                  style={styles.input}
                  placeholderTextColor="#8E8E93"
                  autoCapitalize="words"
                  returnKeyType="done"
                  editable={!isGettingLocation && !isLoading}
                />
              </View>
              <TouchableOpacity 
                style={[styles.gpsButton, (isGettingLocation || isLoading) && styles.gpsButtonDisabled]}
                onPress={getLocationGPS}
                disabled={isGettingLocation || isLoading}
                activeOpacity={0.8}
              >
                {isGettingLocation ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Temperature Unit */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Temperature Unit</Text>
            <View style={styles.radioContainer}>
              {[
                { value: 'C', label: 'Celsius' },
                { value: 'F', label: 'Fahrenheit' }
              ].map((item) => (
                <TouchableOpacity 
                  key={item.value}
                  onPress={() => setUnit(item.value)}
                  style={styles.radioOption}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <View style={[styles.radioCircle, unit === item.value && {borderColor: COLORS.primary}]}>
                    {unit === item.value && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={[styles.radioLabel, unit === item.value && styles.radioLabelActive]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.radioValue, unit === item.value && styles.radioValueActive]}>
                    °{item.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Wardrobe Preference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wardrobe Style</Text>
            <View style={styles.radioContainer}>
              {[
                { value: 'male', label: 'Men' },
                { value: 'female', label: 'Women' },
                { value: 'baby', label: 'Baby' }
              ].map((item) => (
                <TouchableOpacity 
                  key={item.value}
                  onPress={() => setGender(item.value)}
                  style={styles.radioOption}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <View style={[styles.radioCircle, gender === item.value && {borderColor: COLORS.primary}]}>
                    {gender === item.value && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={[styles.radioLabel, gender === item.value && styles.radioLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity 
            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
            onPress={saveAndProceed}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.nextButtonContent}>
              <Text style={styles.nextButtonText}>
                {isLoading ? 'Setting Up...' : 'Next'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
    height: '100%',
  },
  gpsButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  radioContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  radioLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  radioValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  radioValueActive: {
    color: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    marginTop: 30,
    marginHorizontal: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
