import React, { useState, useCallback, useMemo } from 'react';

const ATMKeypad = ({ currentState, handleKeypadInput, executeDfaAction, isReady }) => {
    const [pressedKey, setPressedKey] = useState(null);
    const [cardAnimation, setCardAnimation] = useState(false);

    // Keypad configuration
    const keypadKeys = useMemo(() => [
        '1', '2', '3', 'CLEAR',
        '4', '5', '6', 'CANCEL',
        '7', '8', '9', 'ENTER',
        '0', '', '', ''
    ], []);

    // Menu options configuration
    const menuOptions = useMemo(() => [
        { 
            id: '1', 
            label: 'WITHDRAW', 
            icon: '', 
            color: 'indigo',
            description: 'Withdraw cash from account'
        },
        { 
            id: '2', 
            label: 'DEPOSIT', 
            icon: '', 
            color: 'green',
            description: 'Deposit cash to account'
        },
        { 
            id: '3', 
            label: 'CHECK BALANCE', 
            icon: '', 
            color: 'gray',
            description: 'View current balance'
        }
    ], []);

    // Enhanced button styling function
    const getButtonClass = useCallback((color, isPressed = false) => {
        const base = "w-full px-2 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-md text-white uppercase focus:outline-none focus:ring-2 focus:ring-offset-2";
        const pressed = isPressed ? 'scale-95 shadow-inner' : 'hover:scale-105 active:scale-95';
        
        switch (color) {
            case 'green': 
                return `${base} ${pressed} bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-green-300`;
            case 'indigo': 
                return `${base} ${pressed} bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 focus:ring-indigo-300`;
            case 'red': 
                return `${base} ${pressed} bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-red-300`;
            case 'yellow': 
                return `${base} ${pressed} bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-300 text-gray-900`;
            case 'gray': 
                return `${base} ${pressed} bg-gradient-to-br from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:ring-gray-300`;
            default: 
                return `${base} ${pressed} bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 focus:ring-gray-300`;
        }
    }, []);

    // Handle menu button clicks with animation
    const handleMenuClick = useCallback((e, action, index) => {
        e.preventDefault();
        e.stopPropagation();
        setPressedKey(`menu-${index}`);
        setTimeout(() => {
            executeDfaAction(action);
            setPressedKey(null);
        }, 150);
    }, [executeDfaAction]);

    // Handle keypad key clicks with feedback
    const handleKeyClick = useCallback((e, key, index) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (key === '') return;
        
        setPressedKey(index);
        
        // Haptic feedback simulation (could be replaced with actual vibration API)
        console.log('Key clicked:', key, 'Current state:', currentState);
        
        setTimeout(() => {
            if (key === 'CANCEL') {
                executeDfaAction('CANCEL');
            } else {
                handleKeypadInput(key);
            }
            setPressedKey(null);
        }, 100);
    }, [currentState, executeDfaAction, handleKeypadInput]);

    // Handle card insertion with animation
    const handleCardInsert = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentState === 'S0' && isReady) {
            setCardAnimation(true);
            setTimeout(() => {
                executeDfaAction('INSERT');
                setCardAnimation(false);
            }, 300);
        }
    }, [currentState, isReady, executeDfaAction]);

    // Handle card ejection
    const handleEject = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        executeDfaAction('EJECT');
    }, [executeDfaAction]);

    // Check if key should be disabled
    const isKeyDisabled = useCallback((key) => {
        if (key === '' || !isReady) return true;
        if (currentState === 'S_err' && key !== 'CANCEL') return true;
        if (['S0', 'S3', 'S5', 'S7'].includes(currentState)) return true;
        return false;
    }, [currentState, isReady]);

    // Get key styling based on type
    const getKeyStyle = useCallback((key, index) => {
        const isPressed = pressedKey === index;
        const baseStyle = "h-12 text-lg font-bold rounded-lg shadow-lg transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700";
        
        if (key === '') {
            return `${baseStyle} bg-gray-700 cursor-default opacity-0`;
        }
        
        if (key.match(/[0-9]/)) {
            return `${baseStyle} bg-gradient-to-br from-gray-400 to-gray-600 text-white hover:from-gray-300 hover:to-gray-500 active:shadow-inner ${isPressed ? 'scale-95 shadow-inner' : 'hover:scale-105'}`;
        }
        
        if (key === 'CLEAR') {
            return `${baseStyle} bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 hover:from-yellow-300 hover:to-yellow-500 active:shadow-inner ${isPressed ? 'scale-95 shadow-inner' : 'hover:scale-105'}`;
        }
        
        if (key === 'CANCEL') {
            return `${baseStyle} bg-gradient-to-br from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600 active:shadow-inner ${isPressed ? 'scale-95 shadow-inner' : 'hover:scale-105'}`;
        }
        
        if (key === 'ENTER') {
            return `${baseStyle} bg-gradient-to-br from-green-500 to-green-700 text-white hover:from-green-400 hover:to-green-600 active:shadow-inner ${isPressed ? 'scale-95 shadow-inner' : 'hover:scale-105'}`;
        }
        
        return baseStyle;
    }, [pressedKey]);

    // Get display text for keys
    const getKeyDisplay = (key) => {
        if (key === 'CLEAR') return '⌫';
        if (key === 'CANCEL') return '✕';
        if (key === 'ENTER') return '✓';
        return key;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT SIDE: Keypad */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-gray-600">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-white font-bold text-sm tracking-wide">KEYPAD</h3>
                    <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {keypadKeys.map((key, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={(e) => handleKeyClick(e, key, index)}
                            disabled={isKeyDisabled(key)}
                            className={`${getKeyStyle(key, index)} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
                            aria-label={key === '' ? undefined : `Keypad ${key}`}
                        >
                            <span className="drop-shadow-md">{getKeyDisplay(key)}</span>
                        </button>
                    ))}
                </div>
                <div className="mt-3 text-center">
                    <p className="text-xs text-gray-400 italic">Press keys to input data</p>
                </div>
            </div>

            {/* RIGHT SIDE: Slots and Primary Actions */}
            <div className="flex flex-col space-y-4">
                
                {/* Card Slot */}
                <button
                    type="button"
                    onClick={handleCardInsert}
                    className={`p-5 rounded-2xl text-center transition-all duration-300 border-2 border-dashed shadow-lg ${
                        currentState === 'S0' && isReady 
                            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-500 hover:border-green-600 hover:shadow-xl cursor-pointer hover:scale-105' 
                            : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 text-gray-400 cursor-not-allowed'
                    } ${cardAnimation ? 'animate-pulse' : ''}`}
                    aria-label="Insert card slot"
                    disabled={!(currentState === 'S0' && isReady)}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2 transition-transform duration-300 hover:scale-110">
                            💳
                        </span>
                        <p className={`text-sm font-bold tracking-wide ${currentState === 'S0' ? 'text-green-700' : 'text-gray-400'}`}>
                            {currentState === 'S0' ? 'INSERT CARD' : 'CARD IN USE'}
                        </p>
                        {currentState === 'S0' && isReady && (
                            <p className="text-xs text-green-600 mt-1">Click to begin transaction</p>
                        )}
                    </div>
                </button>

                {/* Eject Button */}
                <button
                    type="button"
                    onClick={handleEject}
                    disabled={currentState === 'S0' || !isReady}
                    className={`${getButtonClass('red', pressedKey === 'eject')} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
                    aria-label="Eject card"
                >
                    <span className="text-xl">⏏️</span>
                    <span>EJECT CARD</span>
                </button>

                {/* Cash Dispenser */}
                <div className="p-5 bg-gradient-to-br from-gray-900 to-black border-t-4 border-yellow-500 text-center rounded-2xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(234,179,8,0.1)_0%,transparent_50%)] pointer-events-none"></div>
                    <div className="relative z-10">
                        <span className="text-4xl block mb-2 animate-bounce-slow"> </span>
                        <p className="text-white text-sm font-bold tracking-wider">
                            CASH DISPENSER
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-mono">
                            ₹100 | ₹500 | ₹2000 notes
                        </p>
                        <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-gradient-to-r from-yellow-500 to-yellow-600 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Menu Buttons - Only shown in S3 state */}
                {currentState === 'S3' && (
                    <div className="space-y-3 animate-fade-in">
                        <div className="text-white text-xs font-bold mb-2 flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
                            <span className="text-yellow-400">●</span>
                            <span>SELECT TRANSACTION</span>
                        </div>
                        {menuOptions.map((option, index) => (
                            <button 
                                key={option.id}
                                type="button"
                                onClick={(e) => handleMenuClick(e, option.id, index)} 
                                className={getButtonClass(option.color, pressedKey === 'menu-' + index) + ' group'}
                                aria-label={option.description}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl group-hover:scale-110 transition-transform">
                                            {option.icon}
                                        </span>
                                        <div className="text-left">
                                            <span className="block">{option.id}. {option.label}</span>
                                            <span className="text-xs opacity-75 font-normal normal-case">
                                                {option.description}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xl opacity-50 group-hover:opacity-100 transition-opacity">
                                        →
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ATMKeypad;