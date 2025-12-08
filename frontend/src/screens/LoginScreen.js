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
  Image,
  StatusBar,
  ScrollView,
  Button
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { loginUser } from "../utils/auth";

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#08427c', 
  secondary: '#4CAF50',
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await loginUser(email, password);
      // navigation handled by AppNavigator automatically
    } catch (err) {
      let errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      Alert.alert("Login Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>
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
          keyboardDismissMode="interactive"
        > 
          <View style={styles.formCard}>
            <View style={styles.loginTitleContainer}>
              <Text style={styles.loginTitle}>Account Login</Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                  }}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                  selectionColor={COLORS.primary}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError("");
                  }}
                  secureTextEntry={secureTextEntry}
                  style={styles.input}
                  editable={!loading}
                  onSubmitEditing={handleLogin}
                  selectionColor={COLORS.primary}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={toggleSecureEntry} disabled={loading}>
                  <Ionicons 
                    name={secureTextEntry ? "eye-off-outline" : "eye-outline"} 
                    size={18} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Social Buttons */}
            <View style={styles.socialDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.socialDividerText}>Or sign in with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton} disabled={loading}>
                <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} disabled={loading}>
                <FontAwesome5 name="facebook-f" size={18} color="#4267B2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} disabled={loading}>
                <Ionicons name="logo-apple" size={20} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Signup */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")} disabled={loading}>
                <Text style={[styles.signupLink, {color: COLORS.primary}]}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  keyboardContainer: { flex: 1 },
  scrollView: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING * 1.5,
    paddingBottom: SPACING * 2,
    paddingTop: SPACING,
    minHeight: height * 0.7,
  },
  header: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 30 : 50,
    paddingBottom: SPACING,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  headerContent: { paddingHorizontal: SPACING, alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 16, backgroundColor: COLORS.card, borderRadius: 60, padding: 8 },
  logoImage: { width: 80, height: 80, tintColor: COLORS.primary },
  welcomeContainer: { alignItems: 'center' },
  welcomeText: { fontSize: FONT_SIZES.title, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  welcomeSubtitle: { fontSize: FONT_SIZES.subtitle, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' },
  formCard: { backgroundColor: COLORS.card, borderRadius: 18, padding: SPACING, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  loginTitleContainer: { marginBottom: SPACING * 1.25, alignItems: 'center' },
  loginTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  inputWrapper: { marginBottom: SPACING * 0.75 },
  inputLabel: { fontSize: FONT_SIZES.inputLabel, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS, borderWidth: 1, borderColor: COLORS.inputBorder, height: 52, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.textPrimary, fontWeight: '400', paddingVertical: 8, paddingRight: 40 },
  eyeIcon: { position: 'absolute', right: 16, paddingVertical: 10, paddingHorizontal: 5 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(231, 76, 60, 0.08)', borderRadius: 8, padding: 12, marginBottom: SPACING * 0.75, borderLeftWidth: 4, borderLeftColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.error, fontWeight: '600', marginLeft: 10, flex: 1 },
  loginButton: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#FFFFFF', fontSize: FONT_SIZES.button, fontWeight: '700' },
  socialDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.inputBorder },
  socialDividerText: { fontSize: 13, color: COLORS.textSecondary, marginHorizontal: 12, fontWeight: '500' },
  socialButtonsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING, gap: 16 },
  socialButton: { width: 55, height: 55, borderRadius: 15, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.inputBorder, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 1 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: SPACING / 2, borderTopWidth: 1, borderTopColor: COLORS.inputBorder },
  signupText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.link },
  signupLink: { fontSize: FONT_SIZES.link, fontWeight: '700' },
});
