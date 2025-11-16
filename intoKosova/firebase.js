import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBuvn_ZyvhGqnnJH1g39pNwQoRaEo6Lzo4",
  authDomain: "intokosova.firebaseapp.com",
  projectId: "intokosova",
  storageBucket: "intokosova.firebasestorage.app",
  messagingSenderId: "1063249578114",
  appId: "1:1063249578114:web:55ce1b1352c24e77f80c9b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export { auth, GoogleAuthProvider, signInWithCredential };

