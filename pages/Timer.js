import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';

const Timer = forwardRef((props, ref) => {
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());

  useImperativeHandle(ref, () => ({
    startTimer,
    stopTimer,
    resetTimer
  }));

  const startTimer = () => {
    if (timerRef.current) return; // Prevent multiple intervals
    lastUpdateTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - lastUpdateTimeRef.current;
      lastUpdateTimeRef.current = now;
      setTime(prevTime => prevTime + elapsedTime);
    }, 10); // Update every 10 milliseconds
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTime(0);
  };

  const formatTime = (time) => {
    const milliseconds = time % 1000;
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
  };

  return (
    <div id="timerContainer">
      <div id="timer">{formatTime(time)}</div>
    </div>
  );
});

export default Timer;