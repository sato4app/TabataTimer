document.addEventListener('DOMContentLoaded', function() {
  // 各入力フィールドとボタンのDOM要素を取得
  const setupTimeInput = document.getElementById('setup');
  const workOutTimeInput = document.getElementById('workout');
  const intervalTimeInput = document.getElementById('rest');
  const setCountInput = document.getElementById('set-count');
  const startBtn = document.getElementById('start');
  const stopBtn = document.getElementById('stop');

  // タイマーの状態を管理するオブジェクト
  const timerState = {
    initialSettings: {
      setup: 0,
      workout: 0,
      rest: 0,
      setCount: 0,
    },
    currentPhase: 'idle', // 'idle', 'setup', 'workout', 'rest'
    timeLeft: 0,
    currentSet: 0,
    intervalId: null,
  };

  // DOM要素が正しく取得できているか確認
  console.log('DOM elements:', {
    setupTimeInput, workOutTimeInput, intervalTimeInput, setCountInput, startBtn, stopBtn
  });

  // タイマーを開始する関数
  // 各フェーズ（セットアップ、ワークアウト、休憩）を順にカウントダウンし、
  // セットが完了するまで繰り返し
  function startTimer() {
    // 既にタイマーが動いていれば何もしない
    if (timerState.intervalId) return;

    timerState.currentSet = 0;
    timerState.currentPhase = 'setup';
    timerState.timeLeft = timerState.initialSettings.setup;

    // 開始時の値をセット数に反映
    setCountInput.value = timerState.initialSettings.setCount;

    // タイマーのカウントダウンを開始
    timerState.intervalId = setInterval(() => {
        if (timerState.timeLeft > 0) {
            timerState.timeLeft--;
            // 画面にカウントダウンの値を反映
            switch (timerState.currentPhase) {
                case 'setup':
                    setupTimeInput.value = timerState.timeLeft;
                    break;
                case 'workout':
                    workOutTimeInput.value = timerState.timeLeft;
                    break;
                case 'rest':
                    intervalTimeInput.value = timerState.timeLeft;
                    break;
            }
            console.log(`Time left: ${timerState.timeLeft} in ${timerState.currentPhase}`);
        } else {
            // 時間が0になったら、各入力欄の表示を元に戻す
            resetInputDisplays();

            // フェーズの切り替え
            switch (timerState.currentPhase) {
                case 'setup':
                    timerState.currentPhase = 'workout';
                    timerState.timeLeft = timerState.initialSettings.workout;
                    break;
                case 'workout':
                    timerState.currentPhase = 'rest';
                    timerState.timeLeft = timerState.initialSettings.rest;
                    break;
                case 'rest':
                    timerState.currentSet++;
                    setCountInput.value = timerState.initialSettings.setCount - timerState.currentSet;
                    if (timerState.currentSet < timerState.initialSettings.setCount) {
                        timerState.currentPhase = 'workout';
                        timerState.timeLeft = timerState.initialSettings.workout;
                    } else {
                        stopTimer();
                    }
                    break;
            }
        }
    }, 1000);
  }

  // タイマーを停止: 現在のカウントダウンをクリアし、数値欄を初期値に戻す
  function stopTimer() {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
    timerState.currentPhase = 'idle';
    resetInputDisplays();
  }

  // 入力欄の表示を初期設定値に戻す
  function resetInputDisplays() {
    setupTimeInput.value = timerState.initialSettings.setup;
    workOutTimeInput.value = timerState.initialSettings.workout;
    intervalTimeInput.value = timerState.initialSettings.rest;
    setCountInput.value = timerState.initialSettings.setCount;
  }

  // スタートボタンがクリックされたときにタイマーを開始
  startBtn.addEventListener('click', function() {
    console.log('Timer started');
    // 現在の入力値を初期設定として保存
    timerState.initialSettings.setup = parseInt(setupTimeInput.value, 10);
    timerState.initialSettings.workout = parseInt(workOutTimeInput.value, 10);
    timerState.initialSettings.rest = parseInt(intervalTimeInput.value, 10);
    timerState.initialSettings.setCount = parseInt(setCountInput.value, 10);
    startTimer();
  });

  // ストップボタンがクリックされたときにタイマーを停止
  stopBtn.addEventListener('click', function() {
    console.log('Timer stopped');
    stopTimer();
  });
});