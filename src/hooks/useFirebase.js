import { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, getDoc, setDoc, onSnapshot
} from 'firebase/firestore';
import { firebaseConfig, initialAuthToken, appId, CORRECT_PIN } from '../utilities/constants';

// ✅ Initialize Firebase OUTSIDE the hook (only once)
let app;
let firebaseAuth;
let firestore;

// Check if Firebase is already initialized
if (!getApps().length) {
    console.log('🔥 Initializing Firebase...');
    app = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(app);
    firestore = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
} else {
    console.log('✅ Firebase already initialized, reusing instance');
    app = getApps()[0];
    firebaseAuth = getAuth(app);
    firestore = getFirestore(app);
}

/**
 * Custom hook to handle Firebase authentication and
 * real-time monitoring of the ATM account balance.
 * 
 * @returns {object} {userId, currentBalance, accountDocRef, isLoading, db}
 */
export const useFirebase = () => {
    const [db] = useState(firestore);
    const [userId, setUserId] = useState(null);
    const [currentBalance, setCurrentBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Authentication
    useEffect(() => {
        const authenticate = async () => {
            try {
                console.log('🔐 Attempting authentication...');
                if (initialAuthToken) {
                    await signInWithCustomToken(firebaseAuth, initialAuthToken);
                    console.log('✅ Signed in with custom token');
                } else {
                    await signInAnonymously(firebaseAuth);
                    console.log('✅ Signed in anonymously');
                }
            } catch (error) {
                console.error("❌ Firebase Auth Error:", error);
                console.error("Error details:", {
                    code: error.code,
                    message: error.message
                });
                setIsLoading(false);
            }
        };

        const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                console.log('✅ User authenticated:', user.uid);
                setUserId(user.uid);
            } else if (!firebaseAuth.currentUser) {
                console.log('⏳ No user found, authenticating...');
                authenticate();
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Memoize the account document reference
    const accountDocRef = useMemo(() => {
        if (!db || !userId) return null;
        // Private Path: /artifacts/{appId}/users/{userId}/atm_account/main_account
        const path = `artifacts/${appId}/users/${userId}/atm_account`;
        console.log('📄 Account path:', path);
        return doc(db, path, 'main_account');
    }, [db, userId]);

    // 2. Account Setup and Real-Time Listener
    useEffect(() => {
        if (!db || !userId || !accountDocRef) {
            if (!userId) setIsLoading(true);
            return;
        }

        let unsubscribeSnapshot = () => {};

        const setupAccountAndListen = async () => {
            try {
                console.log('🔍 Checking if account exists...');
                const docSnap = await getDoc(accountDocRef);
                
                if (!docSnap.exists()) {
                    console.log('💰 Creating new account with ₹5,000.00');
                    await setDoc(accountDocRef, {
                        balance: 5000.00,
                        pin: CORRECT_PIN,
                        createdAt: new Date().toISOString()
                    });
                    console.log("✅ New account created with ₹5,000.00 and PIN 1234.");
                } else {
                    console.log('✅ Account exists:', docSnap.data());
                }
            } catch (error) {
                console.error("❌ Error setting up account:", error);
            } finally {
                setIsLoading(false);
            }

            // Start real-time listener for balance updates
            unsubscribeSnapshot = onSnapshot(accountDocRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    console.log('💵 Balance updated: ₹' + data.balance.toLocaleString('en-IN'));
                    setCurrentBalance(data.balance);
                } else {
                    console.warn('⚠️ Account document does not exist');
                    setCurrentBalance(0);
                }
            }, (error) => {
                console.error("❌ Error fetching account snapshot:", error);
            });
        };

        setupAccountAndListen();

        return () => unsubscribeSnapshot();
    }, [db, userId, accountDocRef]);
    
    return { userId, currentBalance, accountDocRef, isLoading, db };
};