document.addEventListener('DOMContentLoaded', function() {
  let setupTimeInput = document.getElementById('setup-time');
  let workOutTimeInput = document.getElementById('workout-time');
  let intervalTimeInput = document.getElementById('interval-time');
  let startBtn = document.getElementById('start-btn');
  let stopBtn = document.getElementById('stop-btn');

  // 初期値を設定
  // setupTimeInput.value = 3;
  // workOutTimeInput.value = 5;
  // intervalTimeInput.value = 4;

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
  let isFirstSetup = true;

  function startTimer() {
    let setupTime = parseInt(document.getElementById('setup-time').value);
    let workoutTime = parseInt(document.getElementById('workout-time').value);
    let intervalTime = parseInt(document.getElementById('interval-time').value);

    let totalTime = setupTime + workoutTime + intervalTime;
    let countdownDisplay = document.getElementById('countdown-display');

    let countdown = setInterval(function() {
        if (totalTime <= 0) {
            clearInterval(countdown);
            countdownDisplay.textContent = "Time's up";
        } else {
            countdownDisplay.textContent = totalTime + ' seconds remaining';
            totalTime--;
        }
    }, 1000);
  }

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

  startBtn.addEventListener('click', function() {
    console.log('Timer started');
    startTimer();
  });

  stopBtn.addEventListener('click', function() {
    console.log('Timer stopped');
    clearInterval(timerInterval);
  });
});