import React, { useMemo, useState, useEffect } from 'react';
import { STATE_METADATA, formatCurrency } from '../utilities/constants';

const ATMScreen = ({ currentState, screenMessage, pinInput, tempAmountInput, currentBalance }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isBlinking, setIsBlinking] = useState(false);

    const currentMetadata = useMemo(() => 
        STATE_METADATA[currentState] || { name: 'Unknown', color: 'bg-gray-500' }, 
        [currentState]
    );

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Blink effect for input states
    useEffect(() => {
        if (shouldShowInput()) {
            const blinkTimer = setInterval(() => {
                setIsBlinking(prev => !prev);
            }, 500);

            return () => clearInterval(blinkTimer);
        }
    }, [currentState]);

    // Format the current time
    const formatTime = () => {
        return currentTime.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    // Format the current date
    const formatDate = () => {
        return currentTime.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Enhanced input formatting with better masking
    const formatInput = () => {
        if (currentState === 'S1') {
            const masked = pinInput.replace(/./g, '●'); // Better PIN masking with bullet points
            const remaining = 4 - pinInput.length;
            return masked + '—'.repeat(remaining);
        }
        if (currentState === 'S4' || currentState === 'S6') {
            const amount = tempAmountInput || '0';
            // Format with thousands separator
            const formatted = Number(amount).toLocaleString('en-IN');
            return '₹ ' + formatted;
        }
        return '';
    };

    const shouldShowBalance = () => {
        return ['S3', 'S7'].includes(currentState);
    };

    const shouldShowInput = () => {
        return ['S1', 'S4', 'S6'].includes(currentState);
    };

    // Get appropriate input label
    const getInputLabel = () => {
        if (currentState === 'S1') return 'Enter PIN';
        if (currentState === 'S4') return 'Withdrawal Amount';
        if (currentState === 'S6') return 'Deposit Amount';
        return '';
    };

    // Add screen transition animation class
    const getScreenAnimationClass = () => {
        return 'animate-fade-in';
    };

    return (
        <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 h-72 sm:h-80 p-6 rounded-xl border-4 border-gray-900 flex flex-col justify-between relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
            </div>
            
            {/* Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 animate-scan-line"></div>
            </div>

            {/* Header Bar */}
            <div className="flex justify-between items-center relative z-10 mb-2">
                {/* Bank Logo/Name */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-blue-900 font-bold text-sm">₹</span>
                    </div>
                    <span className="text-yellow-400 font-bold text-sm tracking-wide">BANK OF INDIA</span>
                </div>

                {/* State Indicator */}
                <div className={`text-xs font-bold px-3 py-1 rounded-full text-white shadow-lg ${currentMetadata.color} transition-all duration-300`}>
                    {currentMetadata.name}
                </div>
            </div>

            {/* Main Message Area */}
            <div className={`text-center flex-1 flex flex-col justify-center relative z-10 ${getScreenAnimationClass()}`}>
                <p className="text-white text-lg sm:text-xl font-semibold leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4">
                    {screenMessage}
                </p>
                
                {/* Input Display Area */}
                {shouldShowInput() && (
                    <div className="mt-4 mx-auto max-w-sm w-full">
                        <label className="text-cyan-300 text-xs font-medium mb-2 block">
                            {getInputLabel()}
                        </label>
                        <div className="p-4 bg-gray-900 bg-opacity-80 rounded-lg font-mono text-2xl sm:text-3xl text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.3)] border-2 border-yellow-600 backdrop-blur-sm relative">
                            <div className="flex items-center justify-center">
                                {formatInput() || (currentState === 'S1' ? '————' : '₹ 0')}
                                {isBlinking && shouldShowInput() && (
                                    <span className="inline-block w-0.5 h-6 bg-yellow-300 ml-1 animate-pulse"></span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Balance Display */}
                {shouldShowBalance() && (
                    <div className="mt-4 mx-auto max-w-sm w-full animate-slide-up">
                        <div className="p-4 bg-gradient-to-br from-green-900 to-green-950 bg-opacity-60 rounded-lg border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] backdrop-blur-sm">
                            <p className="text-xs sm:text-sm text-green-300 mb-2 font-medium tracking-wide">
                                💰 Available Balance
                            </p>
                            <p className="text-3xl sm:text-4xl font-extrabold text-green-300 drop-shadow-[0_2px_8px_rgba(34,197,94,0.5)] tracking-tight">
                                {formatCurrency(currentBalance || 0)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-400 relative z-10 flex items-center justify-between border-t border-gray-700 pt-3 mt-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🇮🇳</span>
                    <span className="text-gray-400">ATM Simulation</span>
                </div>
                <div className="flex flex-col items-end text-right">
                    <span className="text-green-400 font-semibold text-[10px]">● ONLINE</span>
                    <span className="text-gray-500 text-[10px]">{formatTime()}</span>
                    <span className="text-gray-600 text-[10px]">{formatDate()}</span>
                </div>
            </div>

            {/* Screen Glow Effect */}
            <div className="absolute inset-0 pointer-events-none rounded-xl shadow-[inset_0_0_60px_rgba(59,130,246,0.2)]"></div>
        </div>
    );
};

export default ATMScreen;