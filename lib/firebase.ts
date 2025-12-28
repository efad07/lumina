import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB6v2hwVCZD4qrbfojzLN84dbne-o_bBMU",
  authDomain: "spectra-1aa05.firebaseapp.com",
  projectId: "spectra-1aa05",
  storageBucket: "spectra-1aa05.firebasestorage.app",
  messagingSenderId: "93496528510",
  appId: "1:93496528510:web:08635da0ca5f410376522f",
  measurementId: "G-WQZTPVH81V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;