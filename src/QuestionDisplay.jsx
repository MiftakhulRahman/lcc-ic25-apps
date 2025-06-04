import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const QuestionDisplay = ({ currentRound = 1, setCurrentRound, teams, updateSemiScore }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTimerAlert, setShowTimerAlert] = useState(false);
  const [error, setError] = useState(null);
  const tickSoundRef = useRef(null);
  const timeoutSoundRef = useRef(null);

  const PRIMARY_COLOR = '#08636F';
  const SECONDARY_COLOR = '#FAD800';
  const MAX_SESSIONS = 3;

  // Load questions from CSV
  useEffect(() => {
    setError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    if (typeof currentRound === 'undefined' || currentRound === null) {
      setError('Sesi tidak ditentukan. Harap tentukan nomor sesi (1, 2, atau 3).');
      return;
    }
    if (![1, 2, 3].includes(Number(currentRound))) {
      setError(`Sesi ${currentRound} tidak valid. Pilih sesi 1, 2, atau 3.`);
      return;
    }
    Papa.parse('/data/questions.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const filteredQuestions = result.data
          .filter((row) => {
            const session = String(row.session).trim();
            return session === String(currentRound) && row.question && row.answer;
          })
          .slice(0, 10);
        setQuestions(filteredQuestions);
        if (filteredQuestions.length === 0) {
          setError(`Tidak ada soal yang valid untuk sesi ${currentRound}. Pastikan file CSV berisi soal untuk sesi ini.`);
        }
      },
      error: (error) => {
        console.error('Error loading CSV:', error);
        setError('Gagal memuat soal dari file CSV. Pastikan file ada di public/data/questions.csv.');
      },
    });
  }, [currentRound]);

  // Initialize audio elements
  useEffect(() => {
    tickSoundRef.current = new Audio('/sounds/tick.wav');
    timeoutSoundRef.current = new Audio('/sounds/timeout.wav');
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setTimerRunning(false);
            setShowTimerAlert(true);
            timeoutSoundRef.current.play().catch((e) => console.error('Error playing timeout sound:', e));
            return 0;
          }
          tickSoundRef.current.play().catch((e) => console.error('Error playing tick sound:', e));
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (time) => {
    const seconds = time.toString().padStart(2, '0');
    return `00:${seconds}`;
  };

  const startTimer = () => {
    if (!timerRunning && timer === 0) {
      setTimer(15);
    }
    setTimerRunning(!timerRunning);
    if (timerRunning) {
      tickSoundRef.current.pause();
      tickSoundRef.current.currentTime = 0;
    }
    setShowAnswer(false);
  };

  const resetTimer = () => {
    setTimer(15);
    setTimerRunning(false);
    setShowTimerAlert(false);
    setShowAnswer(false);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetTimer();
    } else if (currentRound < MAX_SESSIONS && typeof setCurrentRound === 'function') {
      setCurrentRound((prevRound) => prevRound + 1);
      setCurrentQuestionIndex(0);
      resetTimer();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetTimer();
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-white rounded-lg p-6 mb-6 flex flex-col justify-center min-h-screen -mt-16" style={{ boxShadow: 'none' }}>
      {/* Header with timer centered */}
      <div className="flex flex-col items-center mb-8 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
          Soal Sesi {currentRound}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <span className="bg-gray-100 px-5 py-2 rounded-lg text-lg font-bold" style={{ color: PRIMARY_COLOR }}>
            {questions.length > 0 ? `${currentQuestionIndex + 1}/${questions.length}` : '0/0'}
          </span>
          
          <div className="flex items-center bg-gray-100 px-5 py-2 rounded-lg">
            <Clock className="mr-2" style={{ color: PRIMARY_COLOR }} />
            <span className="text-2xl font-mono font-bold" style={{ color: timer <= 5 ? '#FF3B30' : PRIMARY_COLOR }}>
              {formatTime(timer)}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={startTimer}
              className="px-4 py-2 rounded-md transition-colors font-medium flex items-center"
              style={{ 
                backgroundColor: timerRunning ? '#FF3B30' : '#34C759', 
                color: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              disabled={questions.length === 0}
            >
              {timerRunning ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors font-medium"
              disabled={questions.length === 0}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-center text-red-600 text-lg">{error}</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-6">Memuat soal...</p>
        </div>
      ) : (
        <>
          {/* Question Card */}
          <div 
            className="p-6 rounded-lg mb-6 transition-all duration-300 max-w-3xl mx-auto"
            style={{ 
              backgroundColor: '#f8f9fa', 
              borderLeft: `6px solid ${PRIMARY_COLOR}`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <p className="text-xl font-medium leading-relaxed mb-4 text-center">{currentQuestion?.question}</p>
            
            {showAnswer && (
              <div className="mt-6 p-4 rounded-lg transition-all duration-300" style={{ backgroundColor: currentQuestion?.answer === 'True' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)' }}>
                <p className="font-bold text-lg mb-2 text-center" style={{ color: currentQuestion?.answer === 'True' ? '#34C759' : '#FF3B30' }}>
                  Jawaban: {currentQuestion?.answer === 'True' ? 'Benar' : 'Salah'}
                </p>
                <p className="text-gray-700 text-center">{currentQuestion?.explanation}</p>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center items-center mt-6 gap-4">
            <button
              onClick={prevQuestion}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors flex items-center font-medium"
              disabled={currentQuestionIndex === 0}
              style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
            >
              <ChevronLeft size={18} className="mr-1" />
              Sebelumnya
            </button>
            
            <button
              onClick={toggleAnswer}
              className="px-6 py-2 rounded-md font-medium transition-colors flex items-center"
              style={{ 
                backgroundColor: showAnswer ? SECONDARY_COLOR : PRIMARY_COLOR, 
                color: showAnswer ? '#000' : '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Eye size={18} className="mr-2" />
              {showAnswer ? 'Sembunyikan Jawaban' : 'Tampilkan Jawaban'}
            </button>
            
            <button
              onClick={nextQuestion}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors flex items-center font-medium"
              disabled={currentQuestionIndex >= questions.length - 1 && currentRound >= MAX_SESSIONS}
              style={{ opacity: currentQuestionIndex >= questions.length - 1 && currentRound >= MAX_SESSIONS ? 0.5 : 1 }}
            >
              Berikutnya
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </>
      )}

      {/* Timer Alert Modal */}
      {showTimerAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 animate-scaleIn">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-500 mb-4">
                <Clock size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: PRIMARY_COLOR }}>
              Waktu Habis!
            </h2>
            <p className="mb-6 text-center text-gray-700">Waktu untuk berpikir telah habis!</p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowTimerAlert(false)}
                className="px-6 py-3 rounded-md text-white font-medium shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default QuestionDisplay;