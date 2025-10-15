import React from 'react';
import { DFA_TRANSITIONS, STATE_METADATA } from '../utilities/constants';

const DFALog = ({ currentState, transitionLog, clearLog }) => {
    const getStateName = (stateKey) => {
        return STATE_METADATA[stateKey]?.name?.split(':')[0] || stateKey;
    };

    const getStateColor = (stateKey) => {
        return STATE_METADATA[stateKey]?.color || 'bg-gray-500';
    };

    return (
        <div className="mt-8 p-6 bg-white rounded-3xl shadow-xl border border-gray-200 grid md:grid-cols-2 gap-8">
            
            {/* DFA Full Model */}
            <div>
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                        DFA Transition Model
                    </h2>
                    <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {DFA_TRANSITIONS.length} transitions
                    </div>
                </div>
                <div className="h-96 overflow-y-auto pr-2">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {DFA_TRANSITIONS.map((t, index) => {
                                const isCurrentState = currentState === t.from;
                                return (
                                    <tr 
                                        key={index} 
                                        className={`transition-colors ${isCurrentState ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className={`px-3 py-2 whitespace-nowrap ${isCurrentState ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                            {getStateName(t.from)}
                                        </td>
                                        <td className={`px-3 py-2 ${isCurrentState ? 'font-semibold text-indigo-600' : 'text-gray-600'}`}>
                                            {t.action}
                                        </td>
                                        <td className={`px-3 py-2 whitespace-nowrap ${isCurrentState ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                            {getStateName(t.to)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Live Transition Log */}
            <div>
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Live Transition Log
                    </h2>
                    <button
                        type="button"
                        onClick={clearLog}
                        disabled={transitionLog.length === 0}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        Clear Log
                    </button>
                </div>
                <div className="h-96 overflow-y-auto pr-2 space-y-2">
                    {transitionLog.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="text-6xl mb-4 opacity-20">📝</div>
                            <p className="text-gray-500 italic">
                                Start interacting with the ATM to see the state transitions...
                            </p>
                        </div>
                    ) : (
                        <>
                            {transitionLog.slice().reverse().map((log) => (
                                <div 
                                    key={log.id} 
                                    className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg shadow-sm border-l-4 border-indigo-500 text-sm hover:shadow-md transition-shadow animate-fadeIn"
                                >
                                    <p className="font-mono text-xs text-gray-500 mb-1">{log.time}</p>
                                    <div className="flex items-center flex-wrap gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getStateColor(log.fromState)}`}>
                                            {log.from}
                                        </span>
                                        <span className="text-indigo-600 font-semibold">→</span>
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-semibold">
                                            {log.action}
                                        </span>
                                        <span className="text-indigo-600 font-semibold">→</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getStateColor(log.toState)}`}>
                                            {log.to}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DFALog;