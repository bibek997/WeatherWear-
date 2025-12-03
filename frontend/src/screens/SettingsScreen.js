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
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ route, navigation }) {
  const { location: loc, unit: u, gender: g } = route.params;
  const [location, setLocation] = useState(loc);
  const [unit, setUnit] = useState(u);
  const [gender, setGender] = useState(g);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!location.trim()) {
      Alert.alert('Location Required', 'Please enter a valid city name.');
      return;
    }

    setSaving(true);
    try {
      const payload = { location: location.trim(), unit, gender };
      await AsyncStorage.setItem('userSetup', JSON.stringify(payload));
      
      // Show success feedback
      Alert.alert(
        'Settings Saved',
        'Your preferences have been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home', payload) }]
      );
    } catch (error) {
      Alert.alert('Save Failed', 'Unable to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Enter your city for accurate weather data
          </Text>
          <TextInput
            placeholder="Enter city name"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>

        {/* Temperature Unit Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="thermometer-outline" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Temperature Unit</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Choose your preferred temperature format
          </Text>
          <View style={styles.optionsContainer}>
            {[
              { value: 'C', label: 'Celsius', symbol: '°C' },
              { value: 'F', label: 'Fahrenheit', symbol: '°F' }
            ].map((item) => (
              <TouchableOpacity 
                key={item.value}
                onPress={() => setUnit(item.value)}
                style={[
                  styles.optionCard,
                  unit === item.value && styles.optionCardActive
                ]}
              >
                <View style={[
                  styles.radioOuter,
                  unit === item.value && styles.radioOuterActive
                ]}>
                  {unit === item.value && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.optionSymbol,
                  unit === item.value && styles.optionSymbolActive
                ]}>
                  {item.symbol}
                </Text>
                <Text style={styles.optionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Wardrobe Preference Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shirt-outline" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Wardrobe Preference</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select for personalized clothing recommendations
          </Text>
          <View style={styles.optionsContainer}>
            {[
              { value: 'male', label: 'Men', icon: 'man' },
              { value: 'female', label: 'Women', icon: 'woman' },
              { value: 'baby', label: 'Kids', icon: 'happy' }
            ].map((item) => (
              <TouchableOpacity 
                key={item.value}
                onPress={() => setGender(item.value)}
                style={[
                  styles.optionCard,
                  gender === item.value && styles.optionCardActive
                ]}
              >
                <View style={[
                  styles.radioOuter,
                  gender === item.value && styles.radioOuterActive
                ]}>
                  {gender === item.value && <View style={styles.radioInner} />}
                </View>
                <Ionicons 
                  name={item.icon} 
                  size={24} 
                  color={gender === item.value ? '#007AFF' : '#666'} 
                />
                <Text style={[
                  styles.optionText,
                  gender === item.value && styles.optionTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={save}
            disabled={saving}
          >
            <Ionicons 
              name={saving ? "time-outline" : "checkmark-circle"} 
              size={20} 
              color="#FFF" 
            />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetToDefaults}
          >
            <Ionicons name="refresh-outline" size={18} color="#666" />
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 80,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FAFBFC',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: 4,
  },
  optionCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E1E5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioOuterActive: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  optionSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  optionSymbolActive: {
    color: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  optionTextActive: {
    color: '#007AFF',
  },
  optionLabel: {
    fontSize: 12,
    color: '#999',
  },
  actionsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#99CFFF',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
    marginLeft: 6,
  },
});