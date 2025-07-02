document.addEventListener('DOMContentLoaded', function() {
  // 各入力フィールドとボタンのDOM要素を取得
  let setupTimeInput = document.getElementById('setup');
  let workOutTimeInput = document.getElementById('workout');
  let intervalTimeInput = document.getElementById('rest');
  let setCountInput = document.getElementById('set-count');
  let startBtn = document.getElementById('start');
  let stopBtn = document.getElementById('stop');

  // DOM要素が正しく取得できているか確認
  console.log('DOM elements:', {
    setupTimeInput,
    workOutTimeInput,
    intervalTimeInput,
    setCountInput,
    startBtn,
    stopBtn
  });

  // タイマーの設定値を取得
  let setupTime = parseInt(setupTimeInput.value);
  let workOutTime = parseInt(workOutTimeInput.value);
  let intervalTime = parseInt(intervalTimeInput.value);

  let numSets = 4;
  let currentSet = 0;
  let timerInterval;
  let isFirstSetup = true;
  let interval;

  /**
   * タイマーを開始する関数
   * 各フェーズ（セットアップ、ワークアウト、休憩）を順にカウントダウンし、
   * セットが完了するまで繰り返します。
   */
  function startTimer() {
    const setupTime = parseInt(document.getElementById('setup').value, 10);
    const workoutTime = parseInt(document.getElementById('workout').value, 10);
    const restTime = parseInt(document.getElementById('rest').value, 10);
    const setCount = parseInt(document.getElementById('set-count').value, 10);

    let currentSet = 0;
    let currentPhase = 'setup';
    let timeLeft = setupTime;

    // タイマーのカウントダウンを開始
    interval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            // 画面にカウントダウンの値を反映
            switch (currentPhase) {
                case 'setup':
                    setupTimeInput.value = timeLeft;
                    break;
                case 'workout':
                    workOutTimeInput.value = timeLeft;
                    break;
                case 'rest':
                    intervalTimeInput.value = timeLeft;
                    break;
            }
            console.log(`Time left: ${timeLeft}`);
        } else {
            // フェーズの切り替え
            switch (currentPhase) {
                case 'setup':
                    currentPhase = 'workout';
                    timeLeft = workoutTime;
                    startWorkOutTimer();
                    break;
                case 'workout':
                    currentPhase = 'rest';
                    timeLeft = restTime;
                    startIntervalTimer();
                    break;
                case 'rest':
                    currentSet++;
                    setCountInput.value = setCount - currentSet; // セット数を反映
                    if (currentSet < setCount) {
                        currentPhase = 'workout';
                        timeLeft = workoutTime;
                        startWorkOutTimer();
                    } else {
                        stopTimer();
                    }
                    break;
            }
        }
    }, 1000);
  }

  // セットアップ時間をカウントダウンし、完了後にワークアウトフェーズを開始
  function startSetupTimer() {
    console.log('Starting setup timer with time:', setupTime);
    let time = setupTime;
    timerInterval = setInterval(function() {
        if (time <= 0) {
            clearInterval(timerInterval);
            isFirstSetup = false;
            startWorkOutTimer();
        } else {
            console.log(`Setup: ${time}s`);
            time--;
        }
    }, 1000);
  }

  // ワークアウト時間をカウントダウンし、完了後に休憩フェーズを開始
  function startWorkOutTimer() {
    console.log(`Start WorkOut Set ${currentSet + 1}`);
    let time = workOutTime;
    timerInterval = setInterval(function() {
        if (time <= 0) {
            clearInterval(timerInterval);
            startIntervalTimer();
        } else {
            console.log(`WorkOut: ${time}s`);
            time--;
        }
    }, 1000);
  }

  // 休憩時間をカウントダウンし、完了後に次のワークアウトフェーズを開始
  function startIntervalTimer() {
    console.log(`Start Interval Set ${currentSet + 1}`);
    let time = intervalTime;
    timerInterval = setInterval(function() {
        if (time <= 0) {
            clearInterval(timerInterval);
            if (currentSet < numSets - 1) {
                currentSet++;
                startWorkOutTimer();
            } else {
                console.log("Training Finished");
            }
        } else {
            console.log(`Interval: ${time}s`);
            time--;
        }
    }, 1000);
  }

  // タイマーを停止: 現在のカウントダウンをクリア
  function stopTimer() {
    clearInterval(interval);
  }

  // スタートボタンがクリックされたときにタイマーを開始
  startBtn.addEventListener('click', function() {
    console.log('Timer started');
    startTimer();
  });

  // ストップボタンがクリックされたときにタイマーを停止
  stopBtn.addEventListener('click', function() {
    console.log('Timer stopped');
    stopTimer();
  });
});