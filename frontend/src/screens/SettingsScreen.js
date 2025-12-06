import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet,
  TouchableOpacity, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function SettingsScreen({ route, navigation }) {
  const { location: loc, unit: u, gender: g } = route.params;
  const [location, setLocation] = useState(loc);
  const [unit, setUnit] = useState(u);
  const [gender, setGender] = useState(g);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getLocationGPS = async () => {
    setIsGettingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use GPS.');
        setIsGettingLocation(false);
        return;
      }

      Alert.alert(
        'Getting Location',
        'Fetching your current location...',
        [{ text: 'OK' }]
      );

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocoding to get city name
      let geocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const city = geocode[0].city || geocode[0].region || geocode[0].subregion;
        if (city) {
          setLocation(city);
          Alert.alert(
            'Location Updated',
            `Your location has been set to ${city}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Location Found',
            `Lat: ${currentLocation.coords.latitude.toFixed(4)}, Lon: ${currentLocation.coords.longitude.toFixed(4)}`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('GPS Error:', error);
      Alert.alert(
        'Location Error',
        'Unable to fetch your location. Please make sure GPS is enabled and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const saveSettings = async () => {
    if (!location.trim()) {
      Alert.alert('Location Required', 'Please enter your location to update settings.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { location: location.trim(), unit, gender };
      await AsyncStorage.setItem('userSetup', JSON.stringify(payload));
      
      Alert.alert(
        'Settings Updated',
        'Your preferences have been saved successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home', payload) }]
      );
    } catch (error) {
      Alert.alert('Save Failed', 'Unable to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setLocation('');
            setUnit('C');
            setGender('male');
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userSetup');
              navigation.replace('Setup');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
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
                  style={[styles.gpsButton, isGettingLocation && styles.gpsButtonDisabled]}
                  onPress={getLocationGPS}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <Ionicons name="sync" size={20} color="#FFFFFF" style={styles.rotatingIcon} />
                  ) : (
                    <Ionicons name="navigate" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Temperature Unit - Radio Buttons */}
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
                >
                  <View style={styles.radioCircle}>
                    {unit === item.value && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={[
                    styles.radioLabel,
                    unit === item.value && styles.radioLabelActive
                  ]}>
                    {item.label}
                  </Text>
                  <Text style={[
                    styles.radioValue,
                    unit === item.value && styles.radioValueActive
                  ]}>
                    °{item.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Wardrobe Preference - Radio Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wardrobe Style</Text>
            <View style={styles.radioContainer}>
              {[
                { value: 'male', label: 'Men' },
                { value: 'female', label: 'Women' },
                { value: 'baby', label: 'Kids' }
              ].map((item) => (
                <TouchableOpacity 
                  key={item.value}
                  onPress={() => setGender(item.value)}
                  style={styles.radioOption}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {gender === item.value && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={[
                    styles.radioLabel,
                    gender === item.value && styles.radioLabelActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={saveSettings}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.saveButtonContent}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="sync" size={20} color="#FFFFFF" style={styles.rotatingIcon} />
                  <Text style={styles.saveButtonText}>Saving...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetToDefaults}
            activeOpacity={0.7}
          >
            <View style={styles.resetButtonContent}>
              <Ionicons name="refresh" size={18} color="#8E8E93" />
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </View>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.logoutButtonContent}>
              <Ionicons name="log-out" size={20} color="#FF3B30" />
              <Text style={styles.logoutButtonText}>Logout</Text>
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
    backgroundColor: '#F8F9FA',
    marginTop: 10, 
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40, 
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 25,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerSpacer: {
    width: 80,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
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
    backgroundColor: '#8E8E93',
  },
  radioContainer: {
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
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
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  radioLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  radioValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  radioValueActive: {
    color: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    marginTop: 20, 
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rotatingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
  },
  resetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  resetButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFD1D1',
    marginBottom: 20, 
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});