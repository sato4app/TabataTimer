document.addEventListener('DOMContentLoaded', function() {
  // 各入力フィールドとボタンのDOM要素を取得
  let setupTimeInput = document.getElementById('setup');
  let workOutTimeInput = document.getElementById('workout');
  let intervalTimeInput = document.getElementById('rest');
  let setCountInput = document.getElementById('set-count');
  let startBtn = document.getElementById('start');
  let stopBtn = document.getElementById('stop');

  // 初期値を保存する変数
  let initialSetupTime;
  let initialWorkOutTime;
  let initialIntervalTime;
  let initialSetCount;

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

  // タイマーを開始する関数
  // 各フェーズ（セットアップ、ワークアウト、休憩）を順にカウントダウンし、
  // セットが完了するまで繰り返し
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
            console.log(`Time left: ${timeLeft} in ${currentPhase}`);
        } else {
            // フェーズの切り替え
            switch (currentPhase) {
                case 'setup':
                    currentPhase = 'workout';
                    timeLeft = workoutTime;
                    break;
                case 'workout':
                    currentPhase = 'rest';
                    timeLeft = restTime;
                    break;
                case 'rest':
                    currentSet++;
                    setCountInput.value = setCount - currentSet; // セット数を反映
                    if (currentSet < setCount) {
                        currentPhase = 'workout';
                        timeLeft = workoutTime;
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
    clearInterval(interval);
    // 数値欄を初期値に戻す
    setupTimeInput.value = initialSetupTime;
    workOutTimeInput.value = initialWorkOutTime;
    intervalTimeInput.value = initialIntervalTime;
    setCountInput.value = initialSetCount;
  }

  // スタートボタンがクリックされたときにタイマーを開始
  startBtn.addEventListener('click', function() {
    console.log('Timer started');
    // 現在の値を初期値として保存
    initialSetupTime = setupTimeInput.value;
    initialWorkOutTime = workOutTimeInput.value;
    initialIntervalTime = intervalTimeInput.value;
    initialSetCount = setCountInput.value;
    startTimer();
  });

  // ストップボタンがクリックされたときにタイマーを停止
  stopBtn.addEventListener('click', function() {
    console.log('Timer stopped');
    stopTimer();
  });
});