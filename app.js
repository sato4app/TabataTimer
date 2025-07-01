document.addEventListener('DOMContentLoaded', function() {
  let setupTimeInput = document.getElementById('setup-time');
  let workOutTimeInput = document.getElementById('workout-time');
  let intervalTimeInput = document.getElementById('interval-time');
  let startBtn = document.getElementById('start-btn');
  let stopBtn = document.getElementById('stop-btn');

  // DOM要素が正しく取得できているか確認
  console.log('DOM elements:', {
    setupTimeInput,
    workOutTimeInput,
    intervalTimeInput,
    startBtn,
    stopBtn
  });

  let setupTime = parseInt(setupTimeInput.value);
  let workOutTime = parseInt(workOutTimeInput.value);
  let intervalTime = parseInt(intervalTimeInput.value);

  let numSets = 4;
  let currentSet = 0;
  let timerInterval;

  function startTimer() {
    startSetupTimer();
  }

  function startSetupTimer() {
    console.log('Starting setup timer with time:', setupTime);
    let time = setupTime;
    timerInterval = setInterval(function() {
        if (time <= 0) {
            clearInterval(timerInterval);
            startWorkOutTimer();
        } else {
            console.log(`Setup: ${time}s`);
            time--;
        }
    }, 1000);
  }

  function startWorkOutTimer() {
    console.log(`Start WorkOut Set ${currentSet + 1}`);
    let time = workOutTime;
    timerInterval = setInterval(function() {
        if (time <= 0) {
            clearInterval(timerInterval);
            if (currentSet < numSets - 1) {
                currentSet++;
                startIntervalTimer();
            } else {
                console.log("Training Finished");
            }
        } else {
            console.log(`WorkOut: ${time}s`);
            time--;
        }
    }, 1000);
  }

  function startIntervalTimer() {
    console.log(`Start Interval Set ${currentSet + 1}`);
    let time = intervalTime;
    timerInterval = setInterval(function() {
        if (time <= 0) {
            clearInterval(timerInterval);
            startWorkOutTimer();
        } else {
            console.log(`Interval: ${time}s`);
            time--;
        }
    }, 1000);
  }

  // イベントリスナーを追加
  startBtn.addEventListener('click', function() {
    console.log('Start button clicked');
    console.log('Setup time input:', setupTimeInput);
    console.log('Workout time input:', workOutTimeInput);
    console.log('Interval time input:', intervalTimeInput);
    
    setupTime = parseInt(setupTimeInput.value);
    workOutTime = parseInt(workOutTimeInput.value);
    intervalTime = parseInt(intervalTimeInput.value);
    
    console.log('Parsed values:', { setupTime, workOutTime, intervalTime });
    
    startTimer();
  });

  stopBtn.addEventListener('click', function() {
    clearInterval(timerInterval);
  });
});