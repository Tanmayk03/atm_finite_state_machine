import React, { useMemo } from 'react';
import { STATE_METADATA, formatCurrency } from '../utilities/constants';

const ATMScreen = ({ currentState, screenMessage, pinInput, tempAmountInput, currentBalance }) => {
    const currentMetadata = useMemo(() => STATE_METADATA[currentState] || { name: 'Unknown', color: 'bg-gray-500' }, [currentState]);

    const formatInput = () => {
        if (currentState === 'S1') {
            return pinInput.replace(/./g, '*'); // Mask PIN
        }
        if (currentState === 'S4' || currentState === 'S6') {
            return '₹' + (tempAmountInput || '0');
        }
        return '';
    };

    const shouldShowBalance = () => {
        return ['S3', 'S7'].includes(currentState);
    };

    const shouldShowInput = () => {
        return ['S1', 'S4', 'S6'].includes(currentState);
    };

    return (
        <div className="bg-blue-900 h-64 p-6 rounded-xl border-4 border-gray-900 flex flex-col justify-between relative shadow-inner overflow-hidden">
            {/* Background Logo */}
            <div 
                className="absolute top-0 left-0 w-full h-full bg-cover opacity-10 pointer-events-none" 
                style={{ backgroundImage: "url('https://placehold.co/600x400/1e3a8a/60a5fa?text=BANK')" }}
            />
            
            {/* State Indicator */}
            <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full text-white shadow-lg ${currentMetadata.color} z-10`}>
                {currentMetadata.name}
            </div>

            {/* Main Message Area */}
            <div className="text-center my-4 pt-4 relative z-10">
                <p className="text-white text-xl font-semibold leading-relaxed drop-shadow-lg">
                    {screenMessage}
                </p>
                
                {/* Input Display Area */}
                {shouldShowInput() && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg font-mono text-3xl text-yellow-300 shadow-xl border-2 border-gray-600">
                        {formatInput() || (currentState === 'S1' ? '----' : '₹0')}
                    </div>
                )}

                {/* Balance Display */}
                {shouldShowBalance() && (
                    <div className="mt-4 p-3 bg-green-900 bg-opacity-50 rounded-lg border-2 border-green-500">
                        <p className="text-sm text-green-300 mb-1">Available Balance</p>
                        <p className="text-3xl font-extrabold text-green-300 drop-shadow-lg">
                            {formatCurrency(currentBalance || 0)}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-left text-xs text-gray-400 relative z-10 flex items-center justify-between">
                <span>🇮🇳 ATM Simulation</span>
                <span className="text-gray-500">24/7 Service</span>
            </div>
        </div>
    );
};

export default ATMScreen;