const { useState, useEffect, useRef, useCallback } = React;

const App = () => {
    // Default constants for Tabata protocol durations
    const DEFAULT_WORK_DURATION = 20;
    const DEFAULT_REST_DURATION = 10;
    const DEFAULT_PREPARE_DURATION = 5;
    const DEFAULT_TOTAL_ROUNDS = 8;

    // State variables for customizable settings
    const [customPrepareDuration, setCustomPrepareDuration] = useState(DEFAULT_PREPARE_DURATION);
    const [customWorkDuration, setCustomWorkDuration] = useState(DEFAULT_WORK_DURATION);
    const [customRestDuration, setCustomRestDuration] = useState(DEFAULT_REST_DURATION);
    const [customTotalRounds, setCustomTotalRounds] = useState(DEFAULT_TOTAL_ROUNDS);

    // State variables for the timer itself
    const [phase, setPhase] = useState('準備'); // '準備', '運動', '休憩', '完了'
    const [time, setTime] = useState(DEFAULT_PREPARE_DURATION);
    const [maxTime, setMaxTime] = useState(DEFAULT_PREPARE_DURATION);
    const [round, setRound] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Audio Ref
    const timerRef = useRef(null);
    const audioContextRef = useRef(null);

    // Audio Playback
    const playBeep = useCallback((frequency = 440, duration = 0.1, type = 'sine') => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

            oscillator.start(audioContextRef.current.currentTime);
            oscillator.stop(audioContextRef.current.currentTime + duration);
        } catch (e) {
            console.error("Audio error:", e);
        }
    }, []);

    const playCountdownBeep = useCallback((remainingSeconds) => {
        if (remainingSeconds >= 1 && remainingSeconds <= 5) {
            playBeep(880, 0.15, 'triangle');
        }
    }, [playBeep]);

    // Timer Logic Effect
    useEffect(() => {
        if (isRunning && time > 0) {
            if (time <= 5 && time > 0) {
                playCountdownBeep(time);
            }
            
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime - 1);
            }, 1000);
        } else if (isRunning && time === 0) {
            clearInterval(timerRef.current);
            timerRef.current = null;

            if (phase === '準備') {
                playBeep(1046.5, 0.4, 'square'); // C6 start work sound
                setPhase('運動');
                const workTime = Number(customWorkDuration) || DEFAULT_WORK_DURATION;
                setTime(workTime);
                setMaxTime(workTime);
            } else if (phase === '運動') {
                const totalRounds = Number(customTotalRounds) || DEFAULT_TOTAL_ROUNDS;
                if (round < totalRounds) {
                    playBeep(659.25, 0.4, 'sine'); // E5 rest sound
                    setPhase('休憩');
                    const restTime = Number(customRestDuration) || DEFAULT_REST_DURATION;
                    setTime(restTime);
                    setMaxTime(restTime);
                } else {
                    // Complete
                    playBeep(1046.5, 0.3, 'triangle');
                    setTimeout(() => playBeep(1318.51, 0.6, 'sine'), 200);
                    setPhase('完了');
                    setIsRunning(false);
                    setTime(0);
                }
            } else if (phase === '休憩') {
                const totalRounds = Number(customTotalRounds) || DEFAULT_TOTAL_ROUNDS;
                if (round < totalRounds) {
                    playBeep(1046.5, 0.4, 'square'); // Start next work round
                    setPhase('運動');
                    const workTime = Number(customWorkDuration) || DEFAULT_WORK_DURATION;
                    setTime(workTime);
                    setMaxTime(workTime);
                    setRound((prevRound) => prevRound + 1);
                }
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, time, phase, round, playBeep, playCountdownBeep, customWorkDuration, customRestDuration, customTotalRounds]);

    const startTimer = () => {
        if (!isRunning && phase !== '完了') {
            const validPrep = customPrepareDuration === '' ? DEFAULT_PREPARE_DURATION : Number(customPrepareDuration) || DEFAULT_PREPARE_DURATION;
            const validWork = customWorkDuration === '' ? DEFAULT_WORK_DURATION : Number(customWorkDuration) || DEFAULT_WORK_DURATION;
            const validRest = customRestDuration === '' ? DEFAULT_REST_DURATION : Number(customRestDuration) || DEFAULT_REST_DURATION;
            const validRounds = customTotalRounds === '' ? DEFAULT_TOTAL_ROUNDS : Number(customTotalRounds) || DEFAULT_TOTAL_ROUNDS;

            setCustomPrepareDuration(validPrep);
            setCustomWorkDuration(validWork);
            setCustomRestDuration(validRest);
            setCustomTotalRounds(validRounds);

            setIsRunning(true);
            setIsInitialLoad(false);

            if (phase === '準備' && (time === 0 || isInitialLoad)) {
                setTime(validPrep);
                setMaxTime(validPrep);
            }
        }
    };

    const pauseTimer = () => {
        setIsRunning(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const resetTimer = () => {
        pauseTimer();
        setPhase('準備');
        setTime(DEFAULT_PREPARE_DURATION);
        setMaxTime(DEFAULT_PREPARE_DURATION);
        setRound(1);
        setIsInitialLoad(true);
        setCustomPrepareDuration(DEFAULT_PREPARE_DURATION);
        setCustomWorkDuration(DEFAULT_WORK_DURATION);
        setCustomRestDuration(DEFAULT_REST_DURATION);
        setCustomTotalRounds(DEFAULT_TOTAL_ROUNDS);
    };

    const handleSettingChange = (setter, value, minValue = 1) => {
        if (value === '') {
            setter('');
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= minValue) {
                setter(numValue);
                if (phase === '準備' && isInitialLoad) {
                    if (setter === setCustomPrepareDuration) {
                        setTime(numValue);
                        setMaxTime(numValue);
                    }
                }
            }
        }
    };

    const adjustValue = (setter, currentValue, delta, minValue = 1) => {
        if (isRunning || phase === '完了') return;
        const current = Number(currentValue) || 0;
        const nextVal = Math.max(minValue, current + delta);
        handleSettingChange(setter, nextVal, minValue);
    };

    // Phase theme configuration
    const getPhaseTheme = () => {
        switch (phase) {
            case '準備':
                return {
                    name: 'PREPARE',
                    colorText: 'text-blue-400',
                    bgGradient: 'from-blue-600/20 via-slate-950 to-slate-950',
                    ringColor: '#3b82f6',
                    glowClass: 'glow-prep',
                    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                };
            case '運動':
                return {
                    name: 'WORK',
                    colorText: 'text-rose-500',
                    bgGradient: 'from-rose-600/25 via-slate-950 to-slate-950',
                    ringColor: '#ff2a5f',
                    glowClass: 'glow-work',
                    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                };
            case '休憩':
                return {
                    name: 'REST',
                    colorText: 'text-emerald-400',
                    bgGradient: 'from-emerald-600/20 via-slate-950 to-slate-950',
                    ringColor: '#10b981',
                    glowClass: 'glow-rest',
                    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                };
            case '完了':
                return {
                    name: 'COMPLETE',
                    colorText: 'text-purple-400',
                    bgGradient: 'from-purple-600/20 via-slate-950 to-slate-950',
                    ringColor: '#a855f7',
                    glowClass: 'glow-finish',
                    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                };
            default:
                return {
                    name: 'TABATA',
                    colorText: 'text-slate-400',
                    bgGradient: 'from-slate-900 via-slate-950 to-slate-950',
                    ringColor: '#64748b',
                    glowClass: '',
                    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700'
                };
        }
    };

    const theme = getPhaseTheme();
    const progressPercent = maxTime > 0 ? (time / maxTime) : 0;
    const strokeDashoffset = 754 - (754 * progressPercent); // SVG Circle circumference for r=120 (2*pi*120 ≈ 753.98)

    return React.createElement('div', {
        className: `h-full w-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b ${theme.bgGradient} transition-colors duration-700 overflow-hidden relative select-none`
    },
        // Decorative background glow orb
        React.createElement('div', {
            className: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
                phase === '運動' ? 'bg-rose-500' : phase === '休憩' ? 'bg-emerald-500' : phase === '準備' ? 'bg-blue-500' : 'bg-purple-500'
            }`
        }),

        // Header Section
        React.createElement('header', {
            className: 'flex justify-between items-center z-10 w-full max-w-lg mx-auto flex-shrink-0'
        },
            React.createElement('div', { className: 'flex items-center space-x-2' },
                React.createElement('div', {
                    className: 'w-3 h-3 rounded-full bg-rose-500 animate-pulse'
                }),
                React.createElement('h1', {
                    className: 'font-display text-xl sm:text-2xl font-black tracking-wider text-white uppercase'
                }, 'TABATA', React.createElement('span', { className: 'text-rose-500' }, 'TIMER+'))
            ),
            React.createElement('div', {
                className: `px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase transition-all duration-300 ${theme.badgeBg}`
            }, phase)
        ),

        // Main Timer Section (Flexible height, automatically stays within view)
        React.createElement('main', {
            className: 'flex-1 flex flex-col items-center justify-center my-2 min-h-0 z-10 w-full max-w-lg mx-auto'
        },
            React.createElement('div', {
                className: `relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 transition-all duration-500 ${theme.glowClass}`
            },
                // Circular SVG Progress Bar
                React.createElement('svg', {
                    className: 'w-full h-full transform -rotate-90',
                    viewBox: '0 0 280 280'
                },
                    // Track circle
                    React.createElement('circle', {
                        cx: '140',
                        cy: '140',
                        r: '120',
                        stroke: 'rgba(255, 255, 255, 0.07)',
                        strokeWidth: '12',
                        fill: 'transparent'
                    }),
                    // Progress circle
                    React.createElement('circle', {
                        cx: '140',
                        cy: '140',
                        r: '120',
                        stroke: theme.ringColor,
                        strokeWidth: '12',
                        strokeDasharray: '754',
                        strokeDashoffset: strokeDashoffset,
                        strokeLinecap: 'round',
                        fill: 'transparent',
                        className: 'transition-all duration-500 ease-linear'
                    })
                ),

                // Center Display Content
                React.createElement('div', {
                    className: 'absolute inset-0 flex flex-col items-center justify-center text-center p-4'
                },
                    React.createElement('span', {
                        className: `font-display text-sm sm:text-base font-extrabold tracking-widest uppercase ${theme.colorText} mb-1`
                    }, theme.name),

                    // Big Countdown Display
                    React.createElement('div', {
                        className: `font-display text-6xl sm:text-7xl font-black text-white tracking-tighter tabular-nums ${time <= 5 && isRunning ? 'scale-110 text-rose-400 transition-transform duration-200 animate-pulse-fast' : ''}`
                    }, String(time).padStart(2, '0')),

                    // Round Counter Display
                    phase !== '完了' ? React.createElement('div', {
                        className: 'mt-2 px-3 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/50 text-slate-300 font-mono text-xs sm:text-sm tracking-wider'
                    }, `ROUND ${round} / ${customTotalRounds}`) : React.createElement('div', {
                        className: 'mt-2 text-amber-300 font-bold text-sm tracking-widest animate-bounce'
                    }, 'GREAT WORK!')
                )
            )
        ),

        // Settings Grid (Compact 4-column glass card)
        React.createElement('section', {
            className: 'w-full max-w-lg mx-auto z-10 flex-shrink-0 mb-3'
        },
            React.createElement('div', {
                className: `glass-card rounded-2xl p-3 grid grid-cols-4 gap-2 transition-opacity duration-300 ${isRunning ? 'opacity-60 pointer-events-none' : 'opacity-100'}`
            },
                // 1. Prepare Duration
                React.createElement('div', { className: 'flex flex-col items-center justify-between bg-slate-900/50 rounded-xl p-2 border border-slate-800/80' },
                    React.createElement('span', { className: 'text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-tight' }, '準備(秒)'),
                    React.createElement('div', { className: 'flex items-center space-x-1 my-1' },
                        React.createElement('button', {
                            onClick: () => adjustValue(setCustomPrepareDuration, customPrepareDuration, -1, 0),
                            className: 'glass-button w-5 h-5 rounded-md flex items-center justify-center text-slate-300 text-xs hover:text-white',
                            disabled: isRunning || phase === '完了'
                        }, '-'),
                        React.createElement('input', {
                            type: 'number',
                            value: customPrepareDuration,
                            onChange: (e) => handleSettingChange(setCustomPrepareDuration, e.target.value, 0),
                            className: 'w-8 bg-transparent text-center text-sm font-bold text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded',
                            disabled: isRunning || phase === '完了'
                        }),
                        React.createElement('button', {
                            onClick: () => adjustValue(setCustomPrepareDuration, customPrepareDuration, 1, 0),
                            className: 'glass-button w-5 h-5 rounded-md flex items-center justify-center text-slate-300 text-xs hover:text-white',
                            disabled: isRunning || phase === '完了'
                        }, '+')
                    )
                ),

                // 2. Work Duration
                React.createElement('div', { className: 'flex flex-col items-center justify-between bg-slate-900/50 rounded-xl p-2 border border-slate-800/80' },
                    React.createElement('span', { className: 'text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-tight' }, '運動(秒)'),
                    React.createElement('div', { className: 'flex items-center space-x-1 my-1' },
                        React.createElement('button', {
                            onClick: () => adjustValue(setCustomWorkDuration, customWorkDuration, -1, 1),
                            className: 'glass-button w-5 h-5 rounded-md flex items-center justify-center text-slate-300 text-xs hover:text-white',
                            disabled: isRunning || phase === '完了'
                        }, '-'),
                        React.createElement('input', {
                            type: 'number',
                            value: customWorkDuration,
                            onChange: (e) => handleSettingChange(setCustomWorkDuration, e.target.value, 1),
                            className: 'w-8 bg-transparent text-center text-sm font-bold text-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500 rounded',
                            disabled: isRunning || phase === '完了'
                        }),
                        React.createElement('button', {
                            onClick: () => adjustValue(setCustomWorkDuration, customWorkDuration, 1, 1),
                            className: 'glass-button w-5 h-5 rounded-md flex items-center justify-center text-slate-300 text-xs hover:text-white',
                            disabled: isRunning || phase === '完了'
                        }, '+')
                    )
                ),

                // 3. Rest Duration
                React.createElement('div', { className: 'flex flex-col items-center justify-between bg-slate-900/50 rounded-xl p-2 border border-slate-800/80' },
                    React.createElement('span', { className: 'text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-tight' }, '休憩(秒)'),
                    React.createElement('div', { className: 'flex items-center space-x-1 my-1' },
                        React.createElement('button', {
                            onClick: () => adjustValue(setCustomRestDuration, customRestDuration, -1, 1),
                            className: 'glass-button w-5 h-5 rounded-md flex items-center justify-center text-slate-300 text-xs hover:text-white',
                            disabled: isRunning || phase === '完了'
                        }, '-'),
                        React.createElement('input', {
                            type: 'number',
                            value: customRestDuration,
                            onChange: (e) => handleSettingChange(setCustomRestDuration, e.target.value, 1),
                            className: 'w-8 bg-transparent text-center text-sm font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded',
                            disabled: isRunning || phase === '完了'
                        }),
                        React.createElement('button', {
                            onClick: () => adjustValue(setCustomRestDuration, customRestDuration, 1, 1),
                            className: 'glass-button w-5 h-5 rounded-md flex items-center justify-center text-slate-300 text-xs hover:text-white',
                            disabled: isRunning || phase === '完了'
                        }, '+')
                    )
                ),

                // 4. Total Rounds
                React.createElement('div', { className: 'flex flex-col items-center justify-between bg-slate-900/50 rounded-xl p-2 border border-slate-800/80' },
                    React.createElement('span', { className: 'text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-tight' }, 'セット数'),
                    React.createElement('div', { className: 'flex items-center space-x-1 my-1' },
                        React.createElement('button', {
                            onClick: () => adjustValue(setCustomTotalRounds, customTotalRounds, -1, 1),
                            className: 'glass-button w-5 h-5 rounded-md flex items-center justify-center text-slate-300 text-xs hover:text-white',
                            disabled: isRunning || phase === '完了'
                        }, '-'),
                        React.createElement('input', {
                            type: 'number',
                            value: customTotalRounds,
                            onChange: (e) => handleSettingChange(setCustomTotalRounds, e.target.value, 1),
                            className: 'w-8 bg-transparent text-center text-sm font-bold text-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded',
                            disabled: isRunning || phase === '完了'
                        }),
                        React.createElement('button', {
                            onClick: () => adjustValue(setCustomTotalRounds, customTotalRounds, 1, 1),
                            className: 'glass-button w-5 h-5 rounded-md flex items-center justify-center text-slate-300 text-xs hover:text-white',
                            disabled: isRunning || phase === '完了'
                        }, '+')
                    )
                )
            )
        ),

        // Action Controls (Bottom fixed size)
        React.createElement('footer', {
            className: 'w-full max-w-lg mx-auto z-10 flex-shrink-0'
        },
            React.createElement('div', { className: 'flex justify-center items-center space-x-3' },
                !isRunning && phase !== '完了' && React.createElement('button', {
                    onClick: startTimer,
                    className: 'flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-extrabold text-lg shadow-lg shadow-rose-500/30 transition transform active:scale-95 flex items-center justify-center space-x-2'
                },
                    React.createElement('svg', { className: 'w-6 h-6 fill-current', viewBox: '0 0 24 24' },
                        React.createElement('path', { d: 'M8 5v14l11-7z' })
                    ),
                    React.createElement('span', null, isInitialLoad ? 'START' : 'RESUME')
                ),

                isRunning && React.createElement('button', {
                    onClick: pauseTimer,
                    className: 'flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold text-lg shadow-lg shadow-amber-500/30 transition transform active:scale-95 flex items-center justify-center space-x-2'
                },
                    React.createElement('svg', { className: 'w-6 h-6 fill-current', viewBox: '0 0 24 24' },
                        React.createElement('path', { d: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' })
                    ),
                    React.createElement('span', null, 'PAUSE')
                ),

                React.createElement('button', {
                    onClick: resetTimer,
                    className: `${!isRunning && phase !== '完了' ? 'w-auto px-5' : 'flex-1'} py-3.5 rounded-2xl glass-button text-slate-300 hover:text-white font-bold text-base transition transform active:scale-95 flex items-center justify-center space-x-2 border border-slate-700/60`
                },
                    React.createElement('svg', { className: 'w-5 h-5 stroke-current fill-none', viewBox: '0 0 24 24', strokeWidth: '2.5' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004 12c0 2.21.817 4.227 2.138 5.765M18 9.578V3.5h-.582m-15.356 2A8.001 8.001 0 0120 12c0-2.21-.817-4.227-2.138-5.765' })
                    ),
                    React.createElement('span', null, 'RESET')
                )
            )
        )
    );
};

ReactDOM.render(React.createElement(App), document.getElementById('root'));