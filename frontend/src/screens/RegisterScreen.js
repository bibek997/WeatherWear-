import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  ScrollView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from "../utils/auth";

const { height } = Dimensions.get('window');

const COLORS = {
  primary: '#08427c',
  background: '#F9F9F9',
  card: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
  inputBorder: '#E0E0E0',
  error: '#E74C3C',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

const FONT_SIZES = {
  title: 26,
  subtitle: 15,
  inputLabel: 14,
  button: 16,
  link: 14,
  error: 12,
};

const BORDER_RADIUS = 10;
const SPACING = 24;
const HORIZONTAL_PADDING = 20;

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerUser(email, password);
      // AppNavigator will handle redirect
    } catch (err) {
      const errorMessage = err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      Alert.alert("Registration Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => setSecureTextEntry(!secureTextEntry);
  const toggleConfirmSecureEntry = () => setConfirmSecureTextEntry(!confirmSecureTextEntry);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.backContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeContainer}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="person-add-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>Join the community today</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            {/* Email */}
            <View style={styles.inputWrapper}> 
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={FONT_SIZES.inputLabel} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={(text) => { setEmail(text); setError(""); }}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  selectionColor={COLORS.primary}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={FONT_SIZES.inputLabel} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={(text) => { setPassword(text); setError(""); }}
                  secureTextEntry={secureTextEntry}
                  style={styles.input}
                  editable={!loading}
                  selectionColor={COLORS.primary}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={toggleSecureEntry} disabled={loading}>
                  <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={FONT_SIZES.inputLabel} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}> 
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={FONT_SIZES.inputLabel} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Re-enter your password"
                  placeholderTextColor="#A0A0A0"
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); setError(""); }}
                  secureTextEntry={confirmSecureTextEntry}
                  style={styles.input}
                  editable={!loading}
                  selectionColor={COLORS.primary}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={toggleConfirmSecureEntry} disabled={loading}>
                  <Ionicons name={confirmSecureTextEntry ? "eye-off-outline" : "eye-outline"} size={FONT_SIZES.inputLabel} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={FONT_SIZES.error + 2} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={loading}>
                <Text style={styles.loginLinkButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardContainer: { flex: 1 },
  scrollView: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: HORIZONTAL_PADDING * 1.5, paddingBottom: SPACING * 2, paddingTop: SPACING * 0.3, minHeight: height * 0.7 },
  header: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingTop: Platform.OS === 'ios' ? 30 : 50, paddingBottom: SPACING, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6 },
  headerContent: { paddingHorizontal: SPACING, alignItems: 'center' },
  backContainer: { width: '100%', alignItems: 'flex-start', marginBottom: 8 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  welcomeContainer: { alignItems: 'center' },
  headerIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING * 0.75, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)' },
  welcomeText: { fontSize: FONT_SIZES.title, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5, marginBottom: 4 },
  welcomeSubtitle: { fontSize: FONT_SIZES.subtitle, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' },
  formCard: { backgroundColor: COLORS.card, borderRadius: 18, padding: SPACING, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8, marginTop: -SPACING * 2 },
  inputWrapper: { marginBottom: SPACING * 0.75 },
  inputLabel: { fontSize: FONT_SIZES.inputLabel, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS, borderWidth: 1, borderColor: COLORS.inputBorder, height: 52, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.textPrimary, fontWeight: '400', paddingRight: 40, paddingVertical: 8 },
  eyeIcon: { position: 'absolute', right: 16, paddingVertical: 10, paddingHorizontal: 5 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(231, 76, 60, 0.08)', borderRadius: 8, padding: 12, marginBottom: SPACING * 0.75, borderLeftWidth: 4, borderLeftColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.error, fontWeight: '600', marginLeft: 10, flex: 1 },
  signupButton: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING * 1.5, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  signupButtonDisabled: { opacity: 0.6 },
  signupButtonText: { color: '#FFFFFF', fontSize: FONT_SIZES.button, fontWeight: '700' },
  loginLinkContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginLinkText: { fontSize: FONT_SIZES.link, color: COLORS.textSecondary, marginRight: 4, fontWeight: '500' },
  loginLinkButtonText: { fontSize: FONT_SIZES.link, color: COLORS.primary, fontWeight: '700' },
});
