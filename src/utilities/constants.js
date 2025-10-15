import { setLogLevel } from 'firebase/firestore';

// Set Firebase log level for debugging
setLogLevel('debug');

// --- CONSTANTS ---
export const CORRECT_PIN = '1234';
export const MAX_PIN_ATTEMPTS = 3;

// ✅ Firebase config - just export the config object, don't initialize here
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// ✅ Debug: Check if env variables are loaded (remove this after testing)
console.log('🔍 Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? '✅ Loaded' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Loaded' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Loaded' : '❌ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✅ Loaded' : '❌ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Loaded' : '❌ Missing',
  appId: firebaseConfig.appId ? '✅ Loaded' : '❌ Missing'
});

export const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// API Configuration for TTS 
export const GEMINI_TTS_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=';
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Currency Formatting
export const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
};

// DFA State Metadata for display and screen 
export const STATE_METADATA = {
    S0: { name: 'S0: IDLE', color: 'bg-gray-400', message: 'Welcome! Press INSERT CARD to begin.', voice: 'Leda' },
    S1: { name: 'S1: PIN ENTRY', color: 'bg-yellow-500', message: 'Please enter your 4-digit PIN and press ENTER.', voice: 'Kore' },
    S3: { name: 'S3: MENU', color: 'bg-blue-600', message: 'Select Transaction: 1. Withdraw 2. Deposit 3. Check Balance', voice: 'Puck' },
    S4: { name: 'S4: WITHDRAWAL', color: 'bg-indigo-600', message: 'Enter withdrawal amount (multiples of ₹100) and press ENTER.', voice: 'Charon' },
    S5: { name: 'S5: COMPLETE', color: 'bg-green-600', message: 'Transaction successful! Please take your cash and card.', voice: 'Zephyr' },
    S6: { name: 'S6: DEPOSIT', color: 'bg-emerald-600', message: 'Enter deposit amount (multiples of ₹100) and press ENTER.', voice: 'Aoede' },
    S7: { name: 'S7: BALANCE CHECK', color: 'bg-cyan-600', message: 'Balance displayed. Select another transaction or EJECT.', voice: 'Puck' },
    S_err: { name: 'S_err: BLOCKED', color: 'bg-red-600', message: 'SECURITY LOCKOUT. Please contact your bank. Press EJECT.', voice: 'Fenrir' },
};

// Full DFA Model Definition for Visualization
export const DFA_TRANSITIONS = [
    { from: 'S0', action: 'INSERT CARD', to: 'S1', description: 'Starts the session.' },
    { from: 'S1', action: 'PIN MATCH (ENTER)', to: 'S3', description: 'Authentication successful.' },
    { from: 'S1', action: 'PIN MISMATCH (<3 attempts)', to: 'S1', description: 'Retry PIN entry.' },
    { from: 'S1', action: 'PIN MISMATCH (3 attempts)', to: 'S_err', description: 'Maximum attempts exceeded (Security Lockout).' },
    { from: 'S1', action: 'CANCEL / EJECT', to: 'S0', description: 'Cancels session.' },
    { from: 'S3', action: '1. WITHDRAW', to: 'S4', description: 'Enter amount for withdrawal.' },
    { from: 'S3', action: '2. DEPOSIT', to: 'S6', description: 'Enter amount for deposit.' },
    { from: 'S3', action: '3. CHECK BALANCE', to: 'S7', description: 'Displays balance.' },
    { from: 'S3', action: 'EJECT / CANCEL', to: 'S0', description: 'Ends session and ejects card.' },
    { from: 'S4', action: 'VALID AMOUNT (ENTER)', to: 'S5', description: 'Funds dispensed.' },
    { from: 'S4', action: 'INSUFFICIENT FUNDS (ENTER)', to: 'S3', description: 'Cannot withdraw, returns to menu.' },
    { from: 'S4', action: 'INVALID AMOUNT (ENTER)', to: 'S4', description: 'Must be multiple of ₹100, retry input.' },
    { from: 'S4', action: 'CANCEL', to: 'S3', description: 'Returns to main menu.' },
    { from: 'S4', action: 'EJECT', to: 'S0', description: 'Ends session and ejects card.' },
    { from: 'S5', action: 'EJECT', to: 'S0', description: 'Session complete, card ejected.' },
    { from: 'S6', action: 'VALID AMOUNT (ENTER)', to: 'S5', description: 'Deposit successful.' },
    { from: 'S6', action: 'INVALID AMOUNT (ENTER)', to: 'S6', description: 'Must be multiple of ₹100, retry input.' },
    { from: 'S6', action: 'AMOUNT EXCEEDS LIMIT', to: 'S6', description: 'Exceeds ₹50,000 limit, retry input.' },
    { from: 'S6', action: 'CANCEL', to: 'S3', description: 'Returns to main menu.' },
    { from: 'S6', action: 'EJECT', to: 'S0', description: 'Ends session and ejects card.' },
    { from: 'S7', action: 'EJECT / CANCEL', to: 'S0', description: 'Balance checked, session ends.' },
    { from: 'S7', action: 'SELECT TRANSACTION', to: 'S3', description: 'Returns to menu for another transaction.' },
    { from: 'S_err', action: 'EJECT', to: 'S0', description: 'Resets the locked machine.' },
];