import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR DATA FROM STEP 4 HERE
const firebaseConfig = {
  apiKey: "AIzaSyCs7Fgv9IlY63VRutOfhKwzv4B0pxeowBI",
  authDomain: "medical-brain-c8ce1.firebaseapp.com",
  projectId: "medical-brain-c8ce1",
  storageBucket: "medical-brain-c8ce1.firebasestorage.app",
  messagingSenderId: "259152946492",
  appId: "1:259152946492:web:47468728c8f4028e696a39",
  measurementId: "G-WG9HZPF025"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);