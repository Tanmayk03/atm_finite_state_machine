// Add this to your ATM_Full_Stack.jsx component

import React, { useState } from "react";
import { updateDoc } from 'firebase/firestore';
import { useFirebase } from "../hooks/useFirebase";
import { useAtmDfa } from "../hooks/useAtmDfa";
import { formatCurrency } from "../utilities/constants";
import ATMScreen from "./ATMScreen";
import ATMKeypad from "./ATMKeypad";
import DFALog from "./DFALog";


const ATM_Full_Stack = () => {
    const { userId, currentBalance, accountDocRef, isLoading, db } = useFirebase();
    const [isResetting, setIsResetting] = useState(false);

    const { 
        currentState, 
        screenMessage, 
        pinInput, 
        tempAmountInput, 
        transitionLog, 
        handleKeypadInput, 
        executeDfaAction, 
        clearLog
    } = useAtmDfa({ currentBalance, accountDocRef, db });
    
    const isReady = !isLoading && userId && currentBalance !== null;

    // ✅ Add Reset Balance Function
    const handleResetBalance = async () => {
        if (!accountDocRef) return;
        
        const confirmReset = window.confirm("Reset balance to ₹5,000.00?");
        if (!confirmReset) return;

        setIsResetting(true);
        try {
            await updateDoc(accountDocRef, {
                balance: 5000.00
            });
            alert("Balance reset to ₹5,000.00 successfully!");
        } catch (error) {
            console.error("Error resetting balance:", error);
            alert("Failed to reset balance. Check console for details.");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans flex flex-col items-center">
            <div className="max-w-4xl w-full mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                    Full-Stack ATM Simulator 🏦🇮🇳
                </h1>

                {/* Status Bar with Reset Button */}
                <div className="bg-indigo-50 p-3 rounded-xl shadow-inner border border-indigo-200 mb-6 text-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-mono text-indigo-800 break-all">
                                <strong>User ID:</strong> <span className="font-bold">{userId || 'Loading...'}</span>
                            </p>
                            <p className="text-sm text-indigo-700 mt-1">
                                <strong>Status:</strong> {isLoading ? 'Connecting to Firestore...' : `Connected. Balance: ${formatCurrency(currentBalance || 0)}`}
                            </p>
                        </div>
                        
                        {/* ✅ Reset Balance Button */}
                        {isReady && (
                            <button
                                onClick={handleResetBalance}
                                disabled={isResetting}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isResetting ? '⏳ Resetting...' : '🔄 Reset Balance'}
                            </button>
                        )}
                    </div>
                </div>

                {/* ATM MACHINE HOUSING */}
                <div className="bg-gray-800 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-8 border-gray-900">
                    
                    {/* ATM SCREEN */}
                    <ATMScreen
                        currentState={currentState}
                        screenMessage={screenMessage}
                        pinInput={pinInput}
                        tempAmountInput={tempAmountInput}
                        currentBalance={currentBalance}
                    />

                    {/* KEYPAD and TRANSACTION SLOTS */}
                    <div className="mt-8">
                        <ATMKeypad 
                            currentState={currentState}
                            handleKeypadInput={handleKeypadInput}
                            executeDfaAction={executeDfaAction}
                            isReady={isReady}
                        />
                    </div>
                </div>

                {/* DFA Visualization and Log */}
                <DFALog 
                    currentState={currentState}
                    transitionLog={transitionLog}
                    clearLog={clearLog}
                />
            </div>
        </div>
    );
};

export default ATM_Full_Stack;