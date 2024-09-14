import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Tambahkan ini

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCigGEUpN2A1dZqDduPHdS_V851YjB_vwg",
  authDomain: "library-57ee0.firebaseapp.com",
  projectId: "library-57ee0",
  storageBucket: "library-57ee0.appspot.com",
  messagingSenderId: "952731499286",
  appId: "1:952731499286:web:461cc60db9d3e504592e37",
  measurementId: "G-C162C0WSQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const storage = getStorage(app); // Inisialisasi Firebase Storage


export { db, storage }; // Pastikan kamu mengekspor storage
