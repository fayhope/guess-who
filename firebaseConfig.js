import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { signInAnonymously as firebaseSignInAnonymously, getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdxz8dEVsfwWJHW717SUHoUNjMprqbibM",
  authDomain: "guess-51528.firebaseapp.com",
  databaseURL: "https://guess-51528-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "guess-51528",
  storageBucket: "guess-51528.firebasestorage.app",
  messagingSenderId: "217224572303",
  appId: "1:217224572303:web:b6900b7329f41e7085affa",
  measurementId: "G-XF23HWBL4T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Renaming your custom function to avoid conflict with Firebase's function
const customSignInAnonymously = async () => {
  try {
    const storedToken = await AsyncStorage.getItem('customToken');

    if (storedToken) {
      // Sign in with the custom token if it exists in AsyncStorage
      console.log("User ID found in storage, signing in with custom token:", storedToken);
      return await signInWithCustomToken(auth, storedToken);
    } else {
      // If no custom token, sign in anonymously and store the token
      const userCredential = await firebaseSignInAnonymously(auth);
      const token = await auth.currentUser.getIdToken();
      
      // Store the new token in AsyncStorage
      await AsyncStorage.setItem('customToken', token);
      
      console.log("User signed in anonymously with new ID token:", token);
      return userCredential;
    }
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

export { auth, customSignInAnonymously, db };

