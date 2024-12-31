
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdxz8dEVsfwWJHW717SUHoUNjMprqbibM",
  authDomain: "guess-51528.firebaseapp.com",
  projectId: "guess-51528",
  storageBucket: "guess-51528.firebasestorage.app",
  messagingSenderId: "217224572303",
  appId: "1:217224572303:web:b6900b7329f41e7085affa",
  measurementId: "G-XF23HWBL4T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
