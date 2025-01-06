
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { signInAnonymously as firebaseSignInAnonymously, getAuth } from "firebase/auth";
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
const auth= getAuth(app);

const signInAnonymously = async () => {
  try {
    const storedUserId = await AsyncStorage.getItem('userId');
  if(storedUserId) {
    console.log("user id found in storage:", storedUserId)
      return await auth.signInWithCustomToken(storedUserId);
  } else {
      const userCredential =  await firebaseSignInAnonymously(auth);
      const userId = userCredential.user.uid
       await AsyncStorage.setItem('userId', userId);
      console.log("User signed in anonymously with new id:", userId)
      return userCredential
      }
  } catch(error) {
      console.error("Error signing in anonymously", error)
      throw error
    }
};

export { auth, db, signInAnonymously };
