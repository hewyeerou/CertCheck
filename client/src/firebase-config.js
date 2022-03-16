import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBZ8vXYCU72a-o0dVwEDYODMnzSHDKzKGM",
    authDomain: "certcheck-b6b72.firebaseapp.com",
    databaseURL: "https://certcheck-b6b72-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "certcheck-b6b72",
    storageBucket: "certcheck-b6b72.appspot.com",
    messagingSenderId: "797585004196",
    appId: "1:797585004196:web:cd815a39eb161391687831",
    measurementId: "G-4ZKMX9GVED"
  };

  const app = initializeApp(firebaseConfig);

  export const db = getDatabase(app);

