import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();   

const CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

export async function signInWithGoogle() {
  const authRequest = new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.Token,
    extraParams: { access_type: 'offline' },
  });

  await authRequest.makeAuthUrlAsync();
  const result = await authSession.startAsync({
    authUrl: authRequest.url,
    returnUrl: REDIRECT_URI,
  });

  if (result.type === 'success') {
    const token = result.params.access_token;
    // get user info
    const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;          // { name, email, picture }
  }
  return null;
}

export async function signOut() {
  await AsyncStorage.removeItem('user');
}