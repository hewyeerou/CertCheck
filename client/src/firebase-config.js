import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBszYeyja1ksm6KCXjyNyuxll9u8hXah7s",
    authDomain: "certcheck-77592.firebaseapp.com",
    databaseURL: "https://certcheck-77592-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "certcheck-77592",
    storageBucket: "certcheck-77592.appspot.com",
    messagingSenderId: "327842839857",
    appId: "1:327842839857:web:13adef67c5b8a571fa4410",
    measurementId: "G-4ZKMX9GVED"
  };

  const app = initializeApp(firebaseConfig);

  export const db = getDatabase(app);

