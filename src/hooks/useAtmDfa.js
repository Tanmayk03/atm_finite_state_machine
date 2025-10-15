import { useState, useCallback } from 'react';
import { updateDoc } from 'firebase/firestore';
import { speak } from '../utilities/ttsUtils';
import { STATE_METADATA, CORRECT_PIN, MAX_PIN_ATTEMPTS, formatCurrency } from '../utilities/constants';

/**
 * Custom hook for managing the ATM's Finite Automata (DFA) state and transitions.
 * @param {object} firebaseState - State returned from useFirebase.
 * @returns {object} { currentState, screenMessage, pinInput, tempAmountInput, pinAttempts, transitionLog, handleTransition, handleKeypadInput, executeDfaAction, clearLog }
 */
export const useAtmDfa = ({ currentBalance, accountDocRef, db }) => {
    const [currentState, setCurrentState] = useState('S0');
    const [screenMessage, setScreenMessage] = useState(STATE_METADATA.S0.message);
    const [pinAttempts, setPinAttempts] = useState(0);
    const [pinInput, setPinInput] = useState('');
    const [tempAmountInput, setTempAmountInput] = useState('');
    const [transitionLog, setTransitionLog] = useState([]);

    // --- DFA TRANSITION HANDLER ---
    const handleTransition = useCallback((nextState, message, action, skipAudio = false) => {
        const prevState = currentState;
        const metadata = STATE_METADATA[nextState];

        // 1. Log the transition
        setTransitionLog(prevLog => [
            { id: Date.now(), from: prevState, action: action, to: nextState, time: new Date().toLocaleTimeString() },
            ...prevLog
        ].slice(0, 50)); // Keep the last 50 transitions

        // 2. Update state variables
        setCurrentState(nextState);
        setScreenMessage(message);

        // State-specific resets
        if (nextState !== 'S1') setPinInput(''); 
        if (nextState !== 'S4' && nextState !== 'S6') setTempAmountInput(''); 
        if (nextState === 'S0' || nextState === 'S_err') setPinAttempts(0);

        // 3. TTS Audio Feedback
        if (!skipAudio) {
            let audioText = message;
            
            // Simplify messages for spoken clarity
            if (nextState === 'S5') {
                audioText = "Transaction successful. Please take your cash and card."; 
            } else if (message.includes('PIN Accepted')) {
                audioText = `Welcome. ${metadata.message}`; 
            }
            
            speak(audioText, metadata.voice);
        }
    }, [currentState]);

    // --- KEYPAD / ACTION LOGIC ---

    const processPinAttempt = useCallback(() => {
        if (pinInput.length !== 4) {
            handleTransition('S1', "PIN must be 4 digits. Press CLEAR and try again.", 'KEYPAD (Invalid Length)', true);
            return;
        }

        if (pinInput === CORRECT_PIN) {
            handleTransition('S3', 'PIN Accepted. Welcome to the main menu. Select Transaction (1, 2, or 3).', 'PIN MATCH (ENTER)');
        } else {
            const newAttempts = pinAttempts + 1;
            setPinAttempts(newAttempts);
            setPinInput(''); // Clear input after failure

            if (newAttempts >= MAX_PIN_ATTEMPTS) {
                handleTransition('S_err', `Maximum PIN attempts (${newAttempts}) exceeded. CARD BLOCKED. Press EJECT.`, 'PIN MISMATCH (3 attempts)');
            } else {
                handleTransition('S1', `PIN Incorrect. You have ${MAX_PIN_ATTEMPTS - newAttempts} attempts remaining. Re-enter PIN.`, `PIN MISMATCH (${newAttempts} attempts)`);
            }
        }
    }, [pinInput, pinAttempts, handleTransition]);

    const processWithdrawal = useCallback(async () => {
        const amount = parseFloat(tempAmountInput);
        
        // Changed validation: must be multiple of ₹100 instead of $10
        if (isNaN(amount) || amount <= 0 || amount % 100 !== 0) {
            handleTransition('S4', "Invalid amount. Must be a multiple of ₹100. Try again or CANCEL.", 'INVALID AMOUNT (ENTER)', true);
            return;
        }
        
        if (currentBalance < amount) {
            handleTransition('S3', "Insufficient funds. Returning to Menu.", 'INSUFFICIENT FUNDS (ENTER)');
            return;
        }

        try {
            await updateDoc(accountDocRef, {
                balance: currentBalance - amount
            });
            const formattedAmount = formatCurrency(amount);
            const formattedNewBalance = formatCurrency(currentBalance - amount);
            handleTransition('S5', `Withdrawal successful. ${formattedAmount} dispensed. Your new balance is ${formattedNewBalance}.`, 'VALID AMOUNT (ENTER)', false);
        } catch (error) {
            console.error("Firestore update failed:", error);
            handleTransition('S3', "Transaction failed due to system error. Please try again.", 'SYSTEM ERROR');
        }
    }, [tempAmountInput, currentBalance, accountDocRef, handleTransition]);

    // ✅ NEW: Process Deposit
    const processDeposit = useCallback(async () => {
        const amount = parseFloat(tempAmountInput);
        
        // Validate deposit amount
        if (isNaN(amount) || amount <= 0 || amount % 100 !== 0) {
            handleTransition('S6', "Invalid amount. Must be a multiple of ₹100. Try again or CANCEL.", 'INVALID AMOUNT (ENTER)', true);
            return;
        }
        
        // Maximum deposit limit (optional)
        if (amount > 50000) {
            handleTransition('S6', "Maximum deposit limit is ₹50,000 per transaction. Try again or CANCEL.", 'AMOUNT EXCEEDS LIMIT', true);
            return;
        }

        try {
            await updateDoc(accountDocRef, {
                balance: currentBalance + amount
            });
            const formattedAmount = formatCurrency(amount);
            const formattedNewBalance = formatCurrency(currentBalance + amount);
            handleTransition('S5', `Deposit successful. ${formattedAmount} credited. Your new balance is ${formattedNewBalance}.`, 'VALID AMOUNT (ENTER)', false);
        } catch (error) {
            console.error("Firestore update failed:", error);
            handleTransition('S3', "Transaction failed due to system error. Please try again.", 'SYSTEM ERROR');
        }
    }, [tempAmountInput, currentBalance, accountDocRef, handleTransition]);
    
    // Handles all user interaction from the physical keypad/buttons
    const handleKeypadInput = (key) => {
        if (currentState !== 'S1' && currentState !== 'S4' && currentState !== 'S6') return;
        
        if (key.match(/[0-9]/)) {
            if (currentState === 'S1' && pinInput.length < 4) {
                setPinInput(prev => prev + key);
            } else if (currentState === 'S4' || currentState === 'S6') {
                setTempAmountInput(prev => prev + key);
            }
        } else if (key === 'CLEAR') {
            if (currentState === 'S1') {
                setPinInput('');
                handleTransition('S1', "PIN cleared. Re-enter your PIN.", 'CLEAR', true);
            }
            if (currentState === 'S4') {
                setTempAmountInput('');
                handleTransition('S4', "Amount cleared. Re-enter withdrawal amount.", 'CLEAR', true);
            }
            if (currentState === 'S6') {
                setTempAmountInput('');
                handleTransition('S6', "Amount cleared. Re-enter deposit amount.", 'CLEAR', true);
            }
        } else if (key === 'ENTER') {
            if (currentState === 'S1') {
                processPinAttempt();
            } else if (currentState === 'S4') {
                processWithdrawal();
            } else if (currentState === 'S6') {
                processDeposit();
            }
        }
    };

    // Handles the core DFA transitions from side buttons (INSERT, EJECT, CANCEL) and Menu selections (1, 2, 3)
    const executeDfaAction = (action) => {
        switch (currentState) {
            case 'S0': 
                if (action === 'INSERT') {
                    handleTransition('S1', STATE_METADATA.S1.message, 'INSERT CARD');
                }
                break;
            case 'S1': 
            case 'S5': 
            case 'S_err': 
                if (action === 'EJECT' || action === 'CANCEL') {
                    handleTransition('S0', 'Thank you for banking with us. Card ejected.', action === 'EJECT' ? 'EJECT' : 'CANCEL / EJECT');
                }
                break;
            case 'S3': // Menu Selections
                if (action === '1') {
                    handleTransition('S4', STATE_METADATA.S4.message, '1. WITHDRAW');
                } else if (action === '3') {
                    const formattedBalance = formatCurrency(currentBalance || 0);
                    handleTransition('S3', `Your current available balance is ${formattedBalance}. Select another transaction or EJECT.`, '3. CHECK BALANCE');
                } else if (action === '2') {
                    handleTransition('S6', "Enter deposit amount (multiples of ₹100) and press ENTER.", '2. DEPOSIT');
                } else if (action === 'EJECT' || action === 'CANCEL') {
                    handleTransition('S0', 'Thank you for banking with us. Card ejected.', action === 'EJECT' ? 'EJECT' : 'CANCEL / EJECT');
                }
                break;
            case 'S4': // Cancel from Withdrawal
                if (action === 'CANCEL') {
                    handleTransition('S3', STATE_METADATA.S3.message, 'CANCEL');
                } else if (action === 'EJECT') {
                    handleTransition('S0', 'Thank you for banking with us. Card ejected.', 'EJECT');
                }
                break;
            case 'S6': // Cancel from Deposit
                if (action === 'CANCEL') {
                    handleTransition('S3', STATE_METADATA.S3.message, 'CANCEL');
                } else if (action === 'EJECT') {
                    handleTransition('S0', 'Thank you for banking with us. Card ejected.', 'EJECT');
                }
                break;
            default:
                console.warn(`Action ${action} not valid in state ${currentState}`);
        }
    };

    // Clear log function
    const clearLog = useCallback(() => {
        setTransitionLog([]);
    }, []);

    return { 
        currentState, 
        screenMessage, 
        pinInput, 
        tempAmountInput, 
        pinAttempts, 
        transitionLog, 
        handleTransition, 
        handleKeypadInput, 
        executeDfaAction,
        clearLog
    };
};