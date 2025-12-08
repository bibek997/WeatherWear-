import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAt2izC2IR2NKB0LlOsd-mLOJjY6TdXcm4",
  authDomain: "weatherwear-cb1c2.firebaseapp.com",
  projectId: "weatherwear-cb1c2",
  storageBucket: "weatherwear-cb1c2.firebasestorage.app",
  messagingSenderId: "590631517950",
  appId: "1:590631517950:android:f32b2482eddfeb36d22faf",
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };
export default app;