import React, { useState, useCallback, useMemo, useEffect } from "react";
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
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

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

    // Memoized status information
    const statusInfo = useMemo(() => ({
        userId: userId || 'Loading...',
        status: isLoading 
            ? 'Connecting to Firestore...' 
            : `Connected. Balance: ${formatCurrency(currentBalance || 0)}`
    }), [userId, isLoading, currentBalance]);

    // Enhanced Reset Balance Function
    const handleResetBalance = useCallback(async () => {
        if (!accountDocRef) {
            setError("Account reference not available. Please refresh the page.");
            return;
        }
        
        const confirmReset = window.confirm(
            `Current Balance: ${formatCurrency(currentBalance || 0)}\n\nReset to ₹5,000.00?`
        );
        if (!confirmReset) return;

        setIsResetting(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            await updateDoc(accountDocRef, {
                balance: 5000.00,
                lastReset: new Date().toISOString()
            });
            
            setSuccessMessage("Balance reset to ₹5,000.00 successfully!");
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err) {
            console.error("Error resetting balance:", err);
            setError(`Failed to reset balance: ${err.message || 'Unknown error'}`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsResetting(false);
        }
    }, [accountDocRef, currentBalance]);

    // Keyboard shortcut for reset (Ctrl/Cmd + Shift + R)
    useEffect(() => {
        const handleKeyPress = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R' && isReady && !isResetting) {
                e.preventDefault();
                handleResetBalance();
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isReady, isResetting, handleResetBalance]);

    // Auto-clear error messages
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-8 font-sans flex flex-col items-center">
            <div className="max-w-4xl w-full mx-auto">
                {/* Header */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 text-center">
                    Full-Stack ATM Simulator 🏦🇮🇳
                </h1>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4 shadow-md animate-fade-in">
                        <div className="flex items-center">
                            <span className="text-xl mr-2">✓</span>
                            <span className="font-medium">{successMessage}</span>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 shadow-md animate-fade-in">
                        <div className="flex items-center">
                            <span className="text-xl mr-2">⚠️</span>
                            <div>
                                <strong className="font-bold">Error:</strong>
                                <span className="block sm:inline sm:ml-2">{error}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ATM MACHINE HOUSING */}
                <div className="bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-8 border-gray-900 mb-6">
                    
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

                {/* Status Bar at Bottom - Loading Skeleton */}
                {isLoading ? (
                    <div className="bg-gray-200 animate-pulse rounded-xl p-4 mt-6 shadow-inner">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                ) : (
                    <div className="bg-indigo-50 p-4 rounded-xl shadow-lg border-2 border-indigo-200 mt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex-1 w-full sm:w-auto">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">System Status</span>
                                </div>
                                <p className="font-mono text-indigo-800 break-all text-xs sm:text-sm">
                                    <strong>User ID:</strong> 
                                    <span className="font-bold ml-2 bg-indigo-100 px-2 py-0.5 rounded">{statusInfo.userId}</span>
                                </p>
                                <p className="text-xs sm:text-sm text-indigo-700 mt-2 flex items-center gap-2">
                                    <strong>Status:</strong> 
                                    <span className="ml-1">{statusInfo.status}</span>
                                </p>
                                <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                                    <span>⌨️</span>
                                    <span className="italic">Keyboard Shortcut: <kbd className="px-2 py-0.5 bg-indigo-200 rounded text-[10px] font-mono">Ctrl+Shift+R</kbd> to reset balance</span>
                                </p>
                            </div>
                            
                            {/* Reset Balance Button */}
                            {isReady && (
                                <button
                                    onClick={handleResetBalance}
                                    disabled={isResetting}
                                    aria-label="Reset account balance to 5000 rupees"
                                    aria-busy={isResetting}
                                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-500 disabled:hover:to-orange-600 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 hover:scale-105 active:scale-95"
                                >
                                    {isResetting ? (
                                        <>
                                            <span className="inline-block animate-spin mr-2">⏳</span>
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            <span className="mr-2">🔄</span>
                                            Reset Balance
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-6 text-center text-xs text-gray-500 pb-4">
                    <p>🔒 Secure ATM Simulation • All transactions are encrypted</p>
                    <p className="mt-1">© 2025 ATM Simulator - Educational Purpose Only</p>
                </div>
            </div>
        </div>
    );
};

export default ATM_Full_Stack;