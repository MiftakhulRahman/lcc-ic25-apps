import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RefreshCw } from 'lucide-react';
import { Howl } from 'howler';

const TimerPenyisihan = () => {
  const [timer, setTimer] = useState(7200); // 120 menit dalam detik
  const [timerRunning, setTimerRunning] = useState(false);
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);
  const [startTime, setStartTime] = useState(null); // Waktu mulai timer

  const tickSoundRef = useRef(null);
  const timeoutSoundRef = useRef(null);

  const PRIMARY_COLOR = '#08636F';
  const SECONDARY_COLOR = '#0DA2B8';

  // Inisialisasi audio
  useEffect(() => {
    tickSoundRef.current = new Howl({ src: '/sounds/tick.wav' });
    timeoutSoundRef.current = new Howl({ src: '/sounds/timeout.wav' });
  }, []);

  // Muat status timer dari localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('timerPenyisihanData');
    if (savedData) {
      try {
        const { timer, timerRunning, startTime } = JSON.parse(savedData);
        setTimer(timer);
        setTimerRunning(timerRunning);
        if (startTime) {
          setStartTime(new Date(startTime));
        }
      } catch (e) {
        console.error("Error parsing saved timer data:", e);
      }
    }
  }, []);

  // Simpan status timer ke localStorage
  useEffect(() => {
    localStorage.setItem(
      'timerPenyisihanData',
      JSON.stringify({ 
        timer, 
        timerRunning,
        startTime: startTime ? startTime.toISOString() : null
      })
    );
  }, [timer, timerRunning, startTime]);

  // Logika timer
  useEffect(() => {
    let interval;
    if (timerRunning) {
      if (!startTime) {
        setStartTime(new Date());
      }
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerRunning(false);
            setShowTimeoutAlert(true);
            timeoutSoundRef.current.play();
            return 0;
          }
          if (prev <= 10) tickSoundRef.current.play();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, startTime]);

  // Format waktu
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return time >= 3600 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
  };

  // Kontrol timer
  const toggleTimer = () => {
    if (!timerRunning && timer === 0) {
      setTimer(7200);
    }
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimer(7200);
    setTimerRunning(false);
    setShowTimeoutAlert(false);
    setStartTime(null);
    localStorage.removeItem('timerPenyisihanData');
  };

  // Menghitung progress timer untuk progress bar
  const timerProgress = (timer / 7200) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <header
        className="text-white py-4 px-6 shadow-md"
        style={{ 
          background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)` 
        }}
      >
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Timer Penyisihan Sesi 1 - Informatika Cup II 2025
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div
          className={`bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full max-w-lg transition-all duration-300 ${
            timer <= 300 ? 'border-4 border-red-500' : 'border border-gray-200'
          }`}
        >
          <div className="flex flex-col items-center">
            {/* Indikator Status Timer */}
            <div className="w-full mb-4 flex justify-center">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                timerRunning 
                  ? 'bg-green-500 animate-pulse' 
                  : timer <= 0 
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              }`}>
                {timerRunning ? 'Timer Berjalan' : timer <= 0 ? 'Waktu Habis' : 'Timer Dijeda'}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  timer <= 300 ? 'bg-red-500' : timer <= 1800 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${timerProgress}%` }}
              ></div>
            </div>
            
            {/* Display Timer */}
            <div
              className={`flex items-center justify-center w-full bg-gray-50 p-4 rounded-lg mb-6 ${
                timer <= 300 ? 'text-red-600 animate-pulse' : 'text-gray-800'
              }`}
              style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
            >
              <Clock 
                className={`mr-2 ${timer <= 300 ? 'text-red-600' : 'text-gray-600'}`} 
                size={28} 
              />
              <span className="text-5xl md:text-6xl font-mono font-semibold tracking-wide">
                {formatTime(timer)}
              </span>
            </div>
            
            {/* Timer Controls */}
            <div className="flex gap-3 w-full justify-center">
              <button
                onClick={toggleTimer}
                className={`px-5 py-2.5 rounded-lg text-white text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center ${
                  timerRunning
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {timerRunning ? (
                  <Pause size={20} className="mr-1.5" />
                ) : (
                  <Play size={20} className="mr-1.5" />
                )}
                {timerRunning ? 'Jeda' : 'Mulai'}
              </button>
              <button
                onClick={resetTimer}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
              >
                <RefreshCw size={20} className="mr-1.5" />
                Reset
              </button>
            </div>
            
            {/* Timer Info */}
            <div className="mt-4 text-center text-gray-500 text-sm">
              <p>Durasi: 120 menit</p>
              {startTime && (
                <p className="mt-1">
                  Waktu mulai: {startTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {showTimeoutAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <Clock className="text-red-500" size={36} />
            </div>
            <h3
              className="text-xl font-semibold mb-3 text-center"
              style={{ color: PRIMARY_COLOR }}
            >
              Waktu Habis!
            </h3>
            <p className="mb-4 text-center text-gray-600 text-sm">
              Babak penyisihan selama 120 menit telah berakhir.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowTimeoutAlert(false)}
                className="px-5 py-2 rounded-lg text-white text-base font-medium shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <footer 
        className="text-white py-3"
        style={{ 
          background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)` 
        }}
      >
        <div className="text-center">
          <p className="text-sm">
            © Informatika Cup II 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TimerPenyisihan;