import React, { useState, useEffect, useRef, useCallback } from 'react';

// Main App component for the Tabata Timer
const App = () => {
    // Default constants for Tabata protocol durations
    const DEFAULT_WORK_DURATION = 20; // seconds
    const DEFAULT_REST_DURATION = 10; // seconds
    const DEFAULT_PREPARE_DURATION = 5; // seconds
    const DEFAULT_TOTAL_ROUNDS = 8; // rounds

    // State variables for customizable settings
    const [customPrepareDuration, setCustomPrepareDuration] = useState(DEFAULT_PREPARE_DURATION); // New state for prepare duration
    const [customWorkDuration, setCustomWorkDuration] = useState(DEFAULT_WORK_DURATION);
    const [customRestDuration, setCustomRestDuration] = useState(DEFAULT_REST_DURATION);
    const [customTotalRounds, setCustomTotalRounds] = useState(DEFAULT_TOTAL_ROUNDS);

    // State variables for the timer itself
    const [phase, setPhase] = useState('準備'); // Current phase: '準備', '運動', '休憩', '完了'
    const [time, setTime] = useState(DEFAULT_PREPARE_DURATION); // Time remaining in current phase
    const [round, setRound] = useState(1); // Current round number
    const [isRunning, setIsRunning] = useState(false); // Whether the timer is running
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag for initial load state (to show '開始' vs '再開')

    // useRef for mutable values that don't trigger re-renders
    const timerRef = useRef(null); // Stores the setInterval ID
    const audioContextRef = useRef(null); // Stores the AudioContext instance

    // Function to play a beep sound
    const playBeep = useCallback((frequency = 440, duration = 0.1) => {
        // Create AudioContext if it doesn't exist
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.type = 'sine'; // Sine wave for a clean beep
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime); // Volume

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + duration);
    }, []);

    // Effect hook for timer logic
    useEffect(() => {
        // Only run timer logic if it's running and there's time left
        if (isRunning && time > 0) {
            // Set up the interval timer
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime - 1);
            }, 1000);
        } else if (isRunning && time === 0) {
            // Clear the current interval when time runs out
            clearInterval(timerRef.current);
            timerRef.current = null; // Ensure ref is nullified after clearing

            // Logic for phase transitions
            if (phase === '準備') {
                playBeep(880); // Higher pitch for start
                setPhase('運動');
                setTime(customWorkDuration); // Use custom work duration
            } else if (phase === '運動') {
                if (round < customTotalRounds) { // Use custom total rounds
                    playBeep(660); // Medium pitch for rest
                    setPhase('休憩');
                    setTime(customRestDuration); // Use custom rest duration
                } else {
                    // All rounds completed
                    playBeep(1000, 0.5); // Long high pitch for completion
                    playBeep(1200, 0.5); // Second long high pitch
                    setPhase('完了');
                    setIsRunning(false);
                    setTime(0); // Ensure time is 0 when done
                }
            } else if (phase === '休憩') {
                if (round < customTotalRounds) { // Use custom total rounds
                    playBeep(880); // Higher pitch for work
                    setPhase('運動');
                    setTime(customWorkDuration); // Use custom work duration
                    setRound((prevRound) => prevRound + 1);
                }
            }
        }

        // Cleanup function: Clear interval when component unmounts or dependencies change
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, time, phase, round, playBeep, customWorkDuration, customRestDuration, customTotalRounds]); // Dependencies for the effect

    // Function to start the timer
    const startTimer = () => {
        // Only start if not already running and not in '完了' phase
        if (!isRunning && phase !== '完了') {
            setIsRunning(true);
            setIsInitialLoad(false); // No longer initial load
            // If starting from '準備' phase, set time to custom prepare duration
            if (phase === '準備' && (time === 0 || isInitialLoad)) {
                setTime(customPrepareDuration);
            }
        }
    };

    // Function to pause the timer
    const pauseTimer = () => {
        setIsRunning(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Function to reset the timer to its initial state and default settings
    const resetTimer = () => {
        pauseTimer();
        setPhase('準備');
        setTime(DEFAULT_PREPARE_DURATION); // Reset to default prepare duration
        setRound(1);
        setIsInitialLoad(true); // Reset to initial load state
        // Reset custom settings to default values as well
        setCustomPrepareDuration(DEFAULT_PREPARE_DURATION); // Reset custom prepare duration
        setCustomWorkDuration(DEFAULT_WORK_DURATION);
        setCustomRestDuration(DEFAULT_REST_DURATION);
        setCustomTotalRounds(DEFAULT_TOTAL_ROUNDS);
    };

    // Determine background color based on the current phase
    const getPhaseColorClass = () => {
        switch (phase) {
            case '準備':
                return 'bg-blue-300';
            case '運動':
                return 'bg-red-400';
            case '休憩':
                return 'bg-green-400';
            case '完了':
                return 'bg-purple-400';
            default:
                return 'bg-gray-200';
        }
    };

    // Handle input change for custom durations/rounds
    const handleSettingChange = (setter, value, minValue = 1) => {
        const numValue = Math.max(minValue, parseInt(value, 10) || minValue); // Ensure positive integer
        setter(numValue);
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${getPhaseColorClass()} font-inter`}>
            <div className="bg-white p-8 rounded-lg shadow-2xl text-center w-full max-w-md">
                <h1 className="text-4xl font-extrabold mb-6 text-gray-800 tracking-tight">
                    タバタタイマー
                </h1>

                {/* Settings Inputs */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"> {/* Adjusted grid for 4 columns */}
                    <div>
                        <label htmlFor="prepareDuration" className="block text-sm font-medium text-gray-700">準備 (秒)</label> {/* New input for prepare duration */}
                        <input
                            type="number"
                            id="prepareDuration"
                            min="0" // Prepare can be 0 seconds
                            value={customPrepareDuration}
                            onChange={(e) => handleSettingChange(setCustomPrepareDuration, e.target.value, 0)} // Min value 0
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg p-2 text-center"
                            disabled={isRunning || phase === '完了'}
                        />
                    </div>
                    <div>
                        <label htmlFor="workDuration" className="block text-sm font-medium text-gray-700">運動 (秒)</label>
                        <input
                            type="number"
                            id="workDuration"
                            min="1"
                            value={customWorkDuration}
                            onChange={(e) => handleSettingChange(setCustomWorkDuration, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg p-2 text-center"
                            disabled={isRunning || phase === '完了'} // Disable inputs when timer is running or completed
                        />
                    </div>
                    <div>
                        <label htmlFor="restDuration" className="block text-sm font-medium text-gray-700">休憩 (秒)</label>
                        <input
                            type="number"
                            id="restDuration"
                            min="1"
                            value={customRestDuration}
                            onChange={(e) => handleSettingChange(setCustomRestDuration, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-lg p-2 text-center"
                            disabled={isRunning || phase === '完了'}
                        />
                    </div>
                    <div>
                        <label htmlFor="totalRounds" className="block text-sm font-medium text-gray-700">セット数</label>
                        <input
                            type="number"
                            id="totalRounds"
                            min="1"
                            value={customTotalRounds}
                            onChange={(e) => handleSettingChange(setCustomTotalRounds, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-lg p-2 text-center"
                            disabled={isRunning || phase === '完了'}
                        />
                    </div>
                </div>

                {/* Display current phase */}
                <p className="text-3xl md:text-4xl font-bold mb-4 text-gray-700 uppercase">
                    {phase}
                </p>

                {/* Display time remaining */}
                <div className="text-7xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter">
                    {String(time).padStart(2, '0')}
                </div>

                {/* Display current round, only if not in '完了' phase */}
                {phase !== '完了' && (
                    <p className="text-xl md:text-2xl font-semibold text-gray-600 mb-8">
                        ラウンド: {round} / {customTotalRounds}
                    </p>
                )}

                {/* Control buttons */}
                <div className="flex justify-center space-x-4">
                    {!isRunning && phase !== '完了' && (
                        <button
                            onClick={startTimer}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.115l-3.397-1.428A1 1 0 0010 10.749v2.502a1 1 0 001.355.992l3.397-1.428a1 1 0 000-1.782z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {isInitialLoad ? '開始' : '再開'}
                        </button>
                    )}

                    {isRunning && (
                        <button
                            onClick={pauseTimer}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            一時停止
                        </button>
                    )}
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Main App component for the Tabata Timer
const App = () => {
    // Default constants for Tabata protocol durations
    const DEFAULT_WORK_DURATION = 20; // seconds
    const DEFAULT_REST_DURATION = 10; // seconds
    const DEFAULT_PREPARE_DURATION = 5; // seconds
    const DEFAULT_TOTAL_ROUNDS = 8; // rounds

    // State variables for customizable settings
    const [customPrepareDuration, setCustomPrepareDuration] = useState(DEFAULT_PREPARE_DURATION); // New state for prepare duration
    const [customWorkDuration, setCustomWorkDuration] = useState(DEFAULT_WORK_DURATION);
    const [customRestDuration, setCustomRestDuration] = useState(DEFAULT_REST_DURATION);
    const [customTotalRounds, setCustomTotalRounds] = useState(DEFAULT_TOTAL_ROUNDS);

    // State variables for the timer itself
    const [phase, setPhase] = useState('準備'); // Current phase: '準備', '運動', '休憩', '完了'
    const [time, setTime] = useState(DEFAULT_PREPARE_DURATION); // Time remaining in current phase
    const [round, setRound] = useState(1); // Current round number
    const [isRunning, setIsRunning] = useState(false); // Whether the timer is running
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag for initial load state (to show '開始' vs '再開')

    // useRef for mutable values that don't trigger re-renders
    const timerRef = useRef(null); // Stores the setInterval ID
    const audioContextRef = useRef(null); // Stores the AudioContext instance

    // Function to play a beep sound
    const playBeep = useCallback((frequency = 440, duration = 0.1) => {
        // Create AudioContext if it doesn't exist
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.type = 'sine'; // Sine wave for a clean beep
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime); // Volume

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + duration);
    }, []);

    // Effect hook for timer logic
    useEffect(() => {
        // Only run timer logic if it's running and there's time left
        if (isRunning && time > 0) {
            // Set up the interval timer
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime - 1);
            }, 1000);
        } else if (isRunning && time === 0) {
            // Clear the current interval when time runs out
            clearInterval(timerRef.current);
            timerRef.current = null; // Ensure ref is nullified after clearing

            // Logic for phase transitions
            if (phase === '準備') {
                playBeep(880); // Higher pitch for start
                setPhase('運動');
                setTime(customWorkDuration); // Use custom work duration
            } else if (phase === '運動') {
                if (round < customTotalRounds) { // Use custom total rounds
                    playBeep(660); // Medium pitch for rest
                    setPhase('休憩');
                    setTime(customRestDuration); // Use custom rest duration
                } else {
                    // All rounds completed
                    playBeep(1000, 0.5); // Long high pitch for completion
                    playBeep(1200, 0.5); // Second long high pitch
                    setPhase('完了');
                    setIsRunning(false);
                    setTime(0); // Ensure time is 0 when done
                }
            } else if (phase === '休憩') {
                if (round < customTotalRounds) { // Use custom total rounds
                    playBeep(880); // Higher pitch for work
                    setPhase('運動');
                    setTime(customWorkDuration); // Use custom work duration
                    setRound((prevRound) => prevRound + 1);
                }
            }
        }

        // Cleanup function: Clear interval when component unmounts or dependencies change
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, time, phase, round, playBeep, customWorkDuration, customRestDuration, customTotalRounds]); // Dependencies for the effect

    // Function to start the timer
    const startTimer = () => {
        // Only start if not already running and not in '完了' phase
        if (!isRunning && phase !== '完了') {
            setIsRunning(true);
            setIsInitialLoad(false); // No longer initial load
            // If starting from '準備' phase, set time to custom prepare duration
            if (phase === '準備' && (time === 0 || isInitialLoad)) {
                setTime(customPrepareDuration);
            }
        }
    };

    // Function to pause the timer
    const pauseTimer = () => {
        setIsRunning(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Function to reset the timer to its initial state and default settings
    const resetTimer = () => {
        pauseTimer();
        setPhase('準備');
        setTime(DEFAULT_PREPARE_DURATION); // Reset to default prepare duration
        setRound(1);
        setIsInitialLoad(true); // Reset to initial load state
        // Reset custom settings to default values as well
        setCustomPrepareDuration(DEFAULT_PREPARE_DURATION); // Reset custom prepare duration
        setCustomWorkDuration(DEFAULT_WORK_DURATION);
        setCustomRestDuration(DEFAULT_REST_DURATION);
        setCustomTotalRounds(DEFAULT_TOTAL_ROUNDS);
    };

    // Determine background color based on the current phase
    const getPhaseColorClass = () => {
        switch (phase) {
            case '準備':
                return 'bg-blue-300';
            case '運動':
                return 'bg-red-400';
            case '休憩':
                return 'bg-green-400';
            case '完了':
                return 'bg-purple-400';
            default:
                return 'bg-gray-200';
        }
    };

    // Handle input change for custom durations/rounds
    const handleSettingChange = (setter, value, minValue = 1) => {
        const numValue = Math.max(minValue, parseInt(value, 10) || minValue); // Ensure positive integer
        setter(numValue);
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${getPhaseColorClass()} font-inter`}>
            <div className="bg-white p-8 rounded-lg shadow-2xl text-center w-full max-w-md">
                <h1 className="text-4xl font-extrabold mb-6 text-gray-800 tracking-tight">
                    タバタタイマー
                </h1>

                {/* Settings Inputs */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"> {/* Adjusted grid for 4 columns */}
                    <div>
                        <label htmlFor="prepareDuration" className="block text-sm font-medium text-gray-700">準備 (秒)</label> {/* New input for prepare duration */}
                        <input
                            type="number"
                            id="prepareDuration"
                            min="0" // Prepare can be 0 seconds
                            value={customPrepareDuration}
                            onChange={(e) => handleSettingChange(setCustomPrepareDuration, e.target.value, 0)} // Min value 0
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg p-2 text-center"
                            disabled={isRunning || phase === '完了'}
                        />
                    </div>
                    <div>
                        <label htmlFor="workDuration" className="block text-sm font-medium text-gray-700">運動 (秒)</label>
                        <input
                            type="number"
                            id="workDuration"
                            min="1"
                            value={customWorkDuration}
                            onChange={(e) => handleSettingChange(setCustomWorkDuration, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg p-2 text-center"
                            disabled={isRunning || phase === '完了'} // Disable inputs when timer is running or completed
                        />
                    </div>
                    <div>
                        <label htmlFor="restDuration" className="block text-sm font-medium text-gray-700">休憩 (秒)</label>
                        <input
                            type="number"
                            id="restDuration"
                            min="1"
                            value={customRestDuration}
                            onChange={(e) => handleSettingChange(setCustomRestDuration, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-lg p-2 text-center"
                            disabled={isRunning || phase === '完了'}
                        />
                    </div>
                    <div>
                        <label htmlFor="totalRounds" className="block text-sm font-medium text-gray-700">セット数</label>
                        <input
                            type="number"
                            id="totalRounds"
                            min="1"
                            value={customTotalRounds}
                            onChange={(e) => handleSettingChange(setCustomTotalRounds, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-lg p-2 text-center"
                            disabled={isRunning || phase === '完了'}
                        />
                    </div>
                </div>

                {/* Display current phase */}
                <p className="text-3xl md:text-4xl font-bold mb-4 text-gray-700 uppercase">
                    {phase}
                </p>

                {/* Display time remaining */}
                <div className="text-7xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter">
                    {String(time).padStart(2, '0')}
                </div>

                {/* Display current round, only if not in '完了' phase */}
                {phase !== '完了' && (
                    <p className="text-xl md:text-2xl font-semibold text-gray-600 mb-8">
                        ラウンド: {round} / {customTotalRounds}
                    </p>
                )}

                {/* Control buttons */}
                <div className="flex justify-center space-x-4">
                    {!isRunning && phase !== '完了' && (
                        <button
                            onClick={startTimer}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.115l-3.397-1.428A1 1 0 0010 10.749v2.502a1 1 0 001.355.992l3.397-1.428a1 1 0 000-1.782z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {isInitialLoad ? '開始' : '再開'}
                        </button>
                    )}

                    {isRunning && (
                        <button
                            onClick={pauseTimer}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            一時停止
                        </button>
                    )}

                    <button
                        onClick={resetTimer}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12c0 2.21.817 4.227 2.138 5.765M18 9.578V3.5h-.582m-15.356 2A8.001 8.001 0 0120 12c0-2.21-.817-4.227-2.138-5.765" />
                        </svg>
                        リセット
                    </button>
                </div>

                {phase === '完了' && (
                    <p className="mt-8 text-2xl font-bold text-gray-700">
                        お疲れ様でした！
                    </p>
                )}
            </div>
        </div>
    );
};

export default App;

                    <button
                        onClick={resetTimer}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12c0 2.21.817 4.227 2.138 5.765M18 9.578V3.5h-.582m-15.356 2A8.001 8.001 0 0120 12c0-2.21-.817-4.227-2.138-5.765" />
                        </svg>
                        リセット
                    </button>
                </div>

                {phase === '完了' && (
                    <p className="mt-8 text-2xl font-bold text-gray-700">
                        お疲れ様でした！
                    </p>
                )}
            </div>
        </div>
    );
};

export default App;
