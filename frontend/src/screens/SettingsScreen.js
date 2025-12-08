import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet,
  TouchableOpacity, 
  ScrollView,
  Alert,
  Dimensions,
  Linking,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

const { width } = Dimensions.get('window');

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

export default function SettingsScreen({ route, navigation }) {
  const { location: loc = '', unit: u = 'C', gender: g = 'male' } = route.params || {};

  const [location, setLocation] = useState(loc);
  const [unit, setUnit] = useState(u);
  const [gender, setGender] = useState(g);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [preferencesExpanded, setPreferencesExpanded] = useState(true); // open by default

  // --- Toggle Preferences ---
  const togglePreferences = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPreferencesExpanded(!preferencesExpanded);
  };

  // --- GPS Location ---
  const getLocationGPS = async () => {
    setIsGettingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use GPS.');
        setIsGettingLocation(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      let geocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const city = geocode[0].city || geocode[0].region || geocode[0].subregion;
        if (city) {
          setLocation(city);
          Alert.alert('Location Updated', `Your location has been set to ${city}`);
        }
      }
    } catch (error) {
      Alert.alert('Location Error', 'Unable to fetch your location.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // --- Save Settings ---
  const saveSettings = async () => {
    if (!location.trim()) {
      Alert.alert('Location Required', 'Please enter your location.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { location: location.trim(), unit, gender };
      await AsyncStorage.setItem('userSetup', JSON.stringify(payload));
      Alert.alert('Settings Updated', 'Preferences saved successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Home', payload) }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Unable to save settings.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Reset Settings ---
  const resetToDefaults = () => {
    Alert.alert('Reset Settings', 'Reset all settings to default values?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setLocation('');
          setUnit('C');
          setGender('male');
          Alert.alert('Reset Complete', 'Settings reset to default values.');
        }
      }
    ]);
  };

  // --- Logout ---
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            await AsyncStorage.removeItem('userSetup');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (error) {
            Alert.alert('Error', 'Failed to log out.');
          }
        }
      }
    ]);
  };

  // --- Report Bug ---
  const handleReportBug = () => {
    const email = 'developer@weatherwear.com';
    const subject = 'Bug Report - Weatherwear App';
    const body = 'Please describe the bug you encountered:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:\n\nDevice info:\n- OS: ' + Platform.OS + ' ' + Platform.Version + '\n- App Version: 1.0.0';
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      .catch(() => {
        Alert.alert('Error', 'Could not open email client. Please email: ' + email);
      });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{paddingBottom: 30}}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.preferencesHeader} onPress={togglePreferences}>
            <View style={styles.optionLeft}>
              <MaterialIcons name="settings" size={22} color={preferencesExpanded ? COLORS.primary : COLORS.textPrimary} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, preferencesExpanded && {color: COLORS.primary}]}>Preferences</Text>
                <Text style={styles.optionSubtitle}>Choose location, °C/°F, wardrobe style</Text>
              </View>
            </View>
            <Ionicons name={preferencesExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {preferencesExpanded && (
            <View style={styles.preferencesContent}>
              {/* Location */}
              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceSectionTitle}>Location</Text>
                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, location.trim() === '' && {borderColor: COLORS.error}]}>
                    <TextInput
                      placeholder="Enter city name"
                      value={location}
                      onChangeText={setLocation}
                      style={styles.input}
                      placeholderTextColor="#8E8E93"
                      editable={!isGettingLocation && !isLoading}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.gpsButton, (isGettingLocation || isLoading) && styles.gpsButtonDisabled]}
                    onPress={getLocationGPS}
                    disabled={isGettingLocation || isLoading}
                  >
                    {isGettingLocation ? <ActivityIndicator color="#fff" /> : <Ionicons name="navigate" size={20} color="#fff" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Temperature Unit */}
              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceSectionTitle}>Temperature Unit</Text>
                <View style={styles.radioContainer}>
                  {['C', 'F'].map((v) => (
                    <TouchableOpacity key={v} onPress={() => setUnit(v)} style={styles.radioOption}>
                      <View style={[styles.radioCircle, unit===v && {borderColor: COLORS.primary}]}>
                        {unit===v && <View style={styles.radioSelected} />}
                      </View>
                      <Text style={[styles.radioLabel, unit===v && styles.radioLabelActive]}>{v==='C' ? 'Celsius' : 'Fahrenheit'}</Text>
                      <Text style={[styles.radioValue, unit===v && styles.radioValueActive]}>°{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Wardrobe */}
              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceSectionTitle}>Wardrobe Style</Text>
                <View style={styles.radioContainer}>
                  {['male','female','baby'].map((v) => (
                    <TouchableOpacity key={v} onPress={() => setGender(v)} style={styles.radioOption}>
                      <View style={[styles.radioCircle, gender===v && {borderColor: COLORS.primary}]}>
                        {gender===v && <View style={styles.radioSelected} />}
                      </View>
                      <Text style={[styles.radioLabel, gender===v && styles.radioLabelActive]}>
                        {v==='male' ? 'Men' : v==='female' ? 'Women' : 'Kids'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.preferenceActions}>
                <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
                  <View style={styles.resetButtonContent}>
                    <Ionicons name="refresh" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={saveSettings} disabled={isLoading}>
                  <View style={styles.saveButtonContent}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <>
                      <Ionicons name="save" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          <TouchableOpacity style={styles.optionItem} onPress={handleReportBug}>
            <View style={styles.optionLeft}>
              <MaterialIcons name="bug-report" size={22} color={COLORS.primary} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Report a bug</Text>
                <Text style={styles.optionSubtitle}>Contact developer via email</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* About & Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Feather name="info" size={22} color={COLORS.textSecondary} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Weatherwear</Text>
                <Text style={styles.optionSubtitle}>Version 1.1.1.1</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutButtonContent}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </View>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- Styles ---
// You can reuse styles from your old settings page
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: COLORS.primary },
  headerTitle: { fontSize: 25, fontWeight: '700', color: COLORS.white },
  section: { marginTop: 20, marginHorizontal: 16, backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  preferencesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  optionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  optionTextContainer: { marginLeft: 12, flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 2 },
  optionSubtitle: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 16 },
  preferencesContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FAFAFA' },
  preferenceSection: { marginBottom: 20 },
  preferenceSectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputContainer: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 8, paddingHorizontal: 12, height: 48, borderWidth: 1.5, borderColor: 'transparent', marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500', height: '100%' },
  gpsButton: { width: 48, height: 48, borderRadius: 8, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center' },
  gpsButtonDisabled: { backgroundColor: COLORS.textSecondary },
  radioContainer: { backgroundColor: '#F9F9F9', borderRadius: 8, overflow: 'hidden' },
  radioOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#C7C7CC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  radioSelected: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  radioLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  radioLabelActive: { color: COLORS.primary, fontWeight: '600' },
  radioValue: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  radioValueActive: { color: COLORS.primary },
  preferenceActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 12 },
  resetButton: { flex: 1, backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.border },
  resetButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  resetButtonText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginLeft: 8 },
  saveButton: { flex: 2, backgroundColor: COLORS.primary, borderRadius: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  saveButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  saveButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logoutButton: { marginTop: 30, marginHorizontal: 16, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.error+'20', overflow: 'hidden' },
  logoutButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  logoutButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.error, marginLeft: 10 }
});
