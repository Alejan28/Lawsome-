// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB-hmC0lFF2g0K0Lu2R9Pf3nPxnVeBUTls",
    authDomain: "lawsome-clmn25.firebaseapp.com",
    projectId: "lawsome-clmn25",
    storageBucket: "lawsome-clmn25.firebasestorage.app",
    messagingSenderId: "678988575790",
    appId: "1:678988575790:web:44896e2f79f4aa95069bbf",
    measurementId: "G-VNR1ET7JDE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
