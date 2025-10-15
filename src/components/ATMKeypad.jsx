import React from 'react';

const ATMKeypad = ({ currentState, handleKeypadInput, executeDfaAction, isReady }) => {
    const keypadKeys = ['1', '2', '3', 'CLEAR', '4', '5', '6', 'CANCEL', '7', '8', '9', 'ENTER', '0', '', '', ''];

    const getButtonClass = (color) => {
        const base = "w-full px-2 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-md text-white uppercase";
        
        switch (color) {
            case 'green': return `${base} bg-green-600 hover:bg-green-700 focus:ring-green-300`;
            case 'indigo': return `${base} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300`;
            case 'red': return `${base} bg-red-600 hover:bg-red-700 focus:ring-red-300`;
            case 'gray': return `${base} bg-gray-600 hover:bg-gray-700 focus:ring-gray-300`;
            default: return `${base} bg-gray-500 hover:bg-gray-600 focus:ring-gray-300`;
        }
    };

    const handleMenuClick = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        executeDfaAction(action);
    };

    const handleKeyClick = (e, key) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Key clicked:', key, 'Current state:', currentState);
        if (key === 'CANCEL') {
            executeDfaAction('CANCEL');
        } else {
            handleKeypadInput(key);
        }
    };

    const handleCardInsert = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentState === 'S0' && isReady) {
            executeDfaAction('INSERT');
        }
    };

    const handleEject = (e) => {
        e.preventDefault();
        e.stopPropagation();
        executeDfaAction('EJECT');
    };
    
    return (
        <div className="grid grid-cols-2 gap-6">
            {/* LEFT SIDE: Keypad */}
            <div className="col-span-1 bg-gray-700 p-4 rounded-xl shadow-inner grid grid-cols-4 gap-3">
                {keypadKeys.map((key, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={(e) => handleKeyClick(e, key)}
                        disabled={
                            key === '' || 
                            !isReady || 
                            (currentState === 'S_err' && key !== 'CANCEL') || 
                            (currentState === 'S0') ||
                            (currentState === 'S3') ||
                            (currentState === 'S5') ||
                            (currentState === 'S7')
                        }
                        className={`
                            h-10 text-xl font-bold rounded-lg shadow-inner
                            ${key.match(/[0-9]/) ? 'bg-gray-500 text-white hover:bg-gray-400' : ''}
                            ${key === 'CLEAR' ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' : ''}
                            ${key === 'CANCEL' ? 'bg-red-500 text-white hover:bg-red-400' : ''}
                            ${key === 'ENTER' ? 'bg-green-600 text-white hover:bg-green-500' : ''}
                            ${key === '' ? 'bg-gray-700 cursor-default' : 'active:shadow-none active:translate-y-0.5'}
                            transition-all duration-100
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {key === 'CLEAR' ? 'CLR' : key === 'CANCEL' ? 'X' : key === 'ENTER' ? 'ENT' : key}
                    </button>
                ))}
            </div>

            {/* RIGHT SIDE: Slots and Primary Actions */}
            <div className="col-span-1 flex flex-col space-y-4">
                
                {/* Card Slot */}
                <div 
                    onClick={handleCardInsert}
                    className={`p-4 rounded-xl text-center transition-all duration-200 border-2 border-dashed ${
                        currentState === 'S0' && isReady 
                            ? 'bg-green-100 border-green-500 hover:bg-green-200 cursor-pointer' 
                            : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <p className="text-sm font-semibold">
                        <span className="text-xl">💳</span>
                        <br/>
                        {currentState === 'S0' ? 'INSERT CARD' : 'CARD RETAINED'}
                    </p>
                </div>

                {/* Eject Button */}
                <button
                    type="button"
                    onClick={handleEject}
                    disabled={currentState === 'S0' || !isReady}
                    className={`${getButtonClass('red')} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    EJECT CARD
                </button>

                {/* Cash Dispenser */}
                <div className="p-4 bg-gray-900 border-t-8 border-gray-600 text-center rounded-xl">
                    <p className="text-white text-sm font-mono">
                        <span className="text-3xl">💸</span>
                        <br/>
                        CASH DISPENSER
                        <br/>
                        <span className="text-xs text-gray-400">(₹100, ₹500, ₹2000 notes)</span>
                    </p>
                </div>

                {/* Menu Buttons (Simulated 1, 2, 3) */}
                {currentState === 'S3' && (
                    <div className="space-y-2 mt-4">
                        <button 
                            type="button"
                            onClick={(e) => handleMenuClick(e, '1')} 
                            className={getButtonClass('indigo')}
                        >
                            1. WITHDRAW
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => handleMenuClick(e, '2')} 
                            className={getButtonClass('green')}
                        >
                            2. DEPOSIT
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => handleMenuClick(e, '3')} 
                            className={getButtonClass('gray')}
                        >
                            3. CHECK BALANCE
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ATMKeypad;