import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { registerUser } from "../utils/auth";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const validateInputs = () => {
    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    // Password length check
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    // Confirm password match
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return null; // valid
  };

  const handleRegister = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      await registerUser(email, password);
      // No navigation — AppNavigator auto-redirects to Setup/Home
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Sign Up" onPress={handleRegister} />

      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 60 },
  title: { fontSize: 28, marginBottom: 20, fontWeight: "600" },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    borderColor: "#aaa",
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontWeight: "500",
  },
});
