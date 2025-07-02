document.addEventListener('DOMContentLoaded', function() {
  let setupTimeInput = document.getElementById('setup');
  let workOutTimeInput = document.getElementById('workout');
  let intervalTimeInput = document.getElementById('rest');
  let startBtn = document.getElementById('start');
  let stopBtn = document.getElementById('stop');

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
  let interval;

  function startTimer() {
    const setupTime = parseInt(document.getElementById('setup').value, 10);
    const workoutTime = parseInt(document.getElementById('workout').value, 10);
    const restTime = parseInt(document.getElementById('rest').value, 10);
    const setCount = parseInt(document.getElementById('set-count').value, 10);

    let currentSet = 0;
    let currentPhase = 'setup';
    let timeLeft = setupTime;

    interval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            console.log(`Time left: ${timeLeft}`); // ここで画面に反映するロジックを追加できます
        } else {
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

  function stopTimer() {
    clearInterval(interval);
  }

  startBtn.addEventListener('click', function() {
    console.log('Timer started');
    startTimer();
  });

  stopBtn.addEventListener('click', function() {
    console.log('Timer stopped');
    stopTimer();
  });
});