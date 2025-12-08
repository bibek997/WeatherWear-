
// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { NavigationContainer } from "@react-navigation/native";
// import SetupScreen from "../screens/SetupScreen";
// import HomeScreen from "../screens/HomeScreen";
// import SettingsScreen from "../screens/SettingsScreen";
// import ForecastDetails from "../screens/ForecastDetailsScreen";

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Setup" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Setup" component={SetupScreen} />
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen name="Settings" component={SettingsScreen} />
//         <Stack.Screen name="ForecastDetails" component={ForecastDetails} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SetupScreen from "../screens/SetupScreen";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ForecastDetails from "../screens/ForecastDetailsScreen";

import { auth } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in (auto-login support)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // true if user exists
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null; // while checking auth

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* If user NOT logged in → show Login + Register */}
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          /* If user logged in → go to Setup then Home */
          <>
            <Stack.Screen name="Setup" component={SetupScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ForecastDetails" component={ForecastDetails} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
