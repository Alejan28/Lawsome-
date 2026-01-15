// src/AuthService.js

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../InitApp/firebase';

/**
 * Înregistrează un utilizator nou și salvează documentul de profil în Firestore.
 */
export const registerUser = async (email, password, firstName, lastName, initialRole = 'test_user') => {
    try {
        // 1. CREEAZĂ UTILIZATORUL în Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const userId = userCredential.user.uid;

        // 2. SALVEAZĂ DATELE DE PROFIL ȘI ROLUL în Firestore
        // Structura se potrivește cu modelul tău (first_name, last_name, role, created_at)
        await setDoc(doc(db, "users", userId), {
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: initialRole, // Exemplu: 'test_user' sau 'client'
            created_at: new Date(), // Salvează ca tip Timestamp
        });

        console.log("Utilizator înregistrat și profil salvat:", userId);
        return userCredential.user;

    } catch (error) {
        console.error("Eroare la înregistrare:", error.message);
        throw error; // Aruncă eroarea pentru a fi afișată în componenta React
    }
};

/**
 * Autentifică un utilizator existent.
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        console.log("Utilizator autentificat:", userCredential.user.uid);
        return userCredential.user;
    } catch (error) {
        console.error("Eroare la autentificare:", error.message);
        throw error;
    }
};