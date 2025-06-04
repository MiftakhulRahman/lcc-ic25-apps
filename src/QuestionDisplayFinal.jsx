import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { Clock, Eye, ChevronLeft, ChevronRight, Shuffle, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";

const QuestionDisplayFinal = () => {
  // Konstanta
  const PRIMARY_COLOR = "#08636F";
  const SECONDARY_COLOR = "#FAD800";
  const MAX_ROUNDS = 5;
  const DEFAULT_TIMER = 10; // Changed from 20 to 10

  const ROUND_TITLES = {
    1: "Sejarah",
    2: "IPA",
    3: "Penjaskes",
    4: "Informatika",
    5: "Campuran",
  };

  // State
  const [currentRound, setCurrentRound] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [cards, setCards] = useState([]);
  const [timer, setTimer] = useState(DEFAULT_TIMER);
  const [customTimerInput, setCustomTimerInput] = useState(DEFAULT_TIMER); // Updated to 10
  const [timerRunning, setTimerRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTimerAlert, setShowTimerAlert] = useState(false);
  const [warningGiven, setWarningGiven] = useState(false);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cardFlipHistory, setCardFlipHistory] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nextRoundDirection, setNextRoundDirection] = useState(null);

  const cardContainerRef = useRef(null);
  const tickSoundRef = useRef(null);
  const timeoutSoundRef = useRef(null);
  const flipSoundRef = useRef(null);
  const shuffleSoundRef = useRef(null);

  // Inisialisasi audio
  useEffect(() => {
    tickSoundRef.current = new Audio("/sounds/tick.wav");
    timeoutSoundRef.current = new Audio("/sounds/timeout.wav");
    flipSoundRef.current = new Audio("/sounds/flip.wav");
    shuffleSoundRef.current = new Audio("/sounds/shuffle.wav");

    return () => {
      [tickSoundRef, timeoutSoundRef, flipSoundRef, shuffleSoundRef].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = "";
        }
      });
    };
  }, []);

  // Load data dari CSV
  useEffect(() => {
    resetRoundState();
    fetchCSVData();
  }, [currentRound]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer((prevTime) => {
          if (prevTime <= 1) { // Check if next tick will reach 0
            clearInterval(interval);
            setTimerRunning(false);
            setShowTimerAlert(true);
            setWarningGiven(false);
            if (soundEnabled) {
              timeoutSoundRef.current.play().catch((e) => console.error("Error playing timeout sound:", e));
            }
            return 0;
          }
          if (prevTime === 10 && !warningGiven) {
            setWarningGiven(true);
          }
          if (soundEnabled && prevTime > 1) { // Only play tick sound if prevTime > 1
            tickSoundRef.current.play().catch((e) => console.error("Error playing tick sound:", e));
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, soundEnabled, warningGiven]);

  // Simpan state ke localStorage
  useEffect(() => {
    const data = { currentRound, cardFlipHistory };
    localStorage.setItem("questionDisplayFinalData", JSON.stringify(data));
  }, [currentRound, cardFlipHistory]);

  // Helper Functions
  const fetchCSVData = () => {
    setError(null);
    Papa.parse("/data/questions_final.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        prepareQuestionsFromData(result.data);
      },
      error: (error) => {
        console.error("Error loading CSV:", error);
        setError("Gagal memuat soal dari file CSV. Pastikan file ada di public/data/questions_final.csv.");
      },
    });
  };

  const prepareQuestionsFromData = (data) => {
    let filteredQuestions;
    if (currentRound === 5) {
      const informatika = data
        .filter((row) => String(row.category).trim().toLowerCase() === "informatika" && String(row.round) === "5")
        .slice(0, 2);
      const ipa = data
        .filter((row) => String(row.category).trim().toLowerCase() === "ipa" && String(row.round) === "5")
        .slice(0, 1);
      const sejarah = data
        .filter((row) => String(row.category).trim().toLowerCase() === "sejarah" && String(row.round) === "5")
        .slice(0, 1);
      const penjaskes = data
        .filter((row) => String(row.category).trim().toLowerCase() === "penjaskes" && String(row.round) === "5")
        .slice(0, 1);
      filteredQuestions = [...informatika, ...ipa, ...sejarah, ...penjaskes].slice(0, 5);
    } else {
      const category = ROUND_TITLES[currentRound].toLowerCase();
      filteredQuestions = data
        .filter((row) => String(row.category).trim().toLowerCase() === category && String(row.round) === String(currentRound))
        .slice(0, 5);
    }

    if (filteredQuestions.length < 5) {
      setError(`Tidak cukup soal untuk putaran ${currentRound} (${ROUND_TITLES[currentRound]}). Hanya ditemukan ${filteredQuestions.length} soal.`);
      return;
    }

    setQuestions(filteredQuestions);
    const newCards = filteredQuestions.map((q, index) => ({
      id: index,
      cardNumber: index + 1,
      category: q.category,
      isFlipped: cardFlipHistory.includes(index),
    }));
    setCards(newCards);
  };

  const resetRoundState = () => {
    setQuestions([]);
    setCurrentQuestionIndex(null);
    setCards([]);
    setTimer(customTimerInput || DEFAULT_TIMER);
    setCustomTimerInput(customTimerInput || DEFAULT_TIMER);
    setTimerRunning(false);
    setShowAnswer(false);
    setShowTimerAlert(false);
    setWarningGiven(false);
    setError(null);
    setCardFlipHistory([]);
  };

  const formatTime = (time) => {
    return time < 10 ? `00:0${time}` : `00:${time}`;
  };

  const shuffleCards = () => {
    if (cards.length === 5) {
      const unflippedCards = cards.filter((card) => !card.isFlipped);
      const flippedCards = cards.filter((card) => card.isFlipped);
      const shuffledUnflipped = [...unflippedCards].sort(() => Math.random() - 0.5);
      setCards([...flippedCards, ...shuffledUnflipped]);
      if (soundEnabled) {
        shuffleSoundRef.current.play().catch((e) => console.error("Error playing shuffle sound:", e));
      }
      if (cardContainerRef.current) {
        cardContainerRef.current.classList.add("shake-animation");
        setTimeout(() => {
          if (cardContainerRef.current) {
            cardContainerRef.current.classList.remove("shake-animation");
          }
        }, 500);
      }
    }
  };

  const flipCard = (cardId) => {
    if (currentQuestionIndex !== null || cardFlipHistory.includes(cardId)) return;
    setCardFlipHistory((prev) => [...prev, cardId]);
    setCards((prevCards) =>
      prevCards.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card))
    );
    setCurrentQuestionIndex(cardId);
    setTimer(customTimerInput || DEFAULT_TIMER);
    setTimerRunning(false);
    setShowAnswer(false);
    if (soundEnabled) {
      flipSoundRef.current.play().catch((e) => console.error("Error playing flip sound:", e));
    }
  };

  const startTimer = () => {
    if (!timerRunning && timer === 0) {
      const newTimer = customTimerInput > 0 ? customTimerInput : DEFAULT_TIMER;
      setTimer(newTimer);
      setWarningGiven(false);
    }
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    const newTimer = customTimerInput > 0 ? customTimerInput : DEFAULT_TIMER;
    setTimer(newTimer);
    setTimerRunning(false);
    setShowTimerAlert(false);
    setWarningGiven(false);
  };

  const handleCustomTimerChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setCustomTimerInput(value);
      if (!timerRunning) {
        setTimer(value || DEFAULT_TIMER);
      }
    } else {
      setCustomTimerInput("");
    }
  };

  const confirmRoundChange = (direction) => {
    setNextRoundDirection(direction);
    setShowConfirmModal(true);
  };

  const handleRoundChange = () => {
    if (nextRoundDirection === "next" && currentRound < MAX_ROUNDS) {
      setCurrentRound((prev) => prev + 1);
    } else if (nextRoundDirection === "prev" && currentRound > 1) {
      setCurrentRound((prev) => prev - 1);
    }
    setShowConfirmModal(false);
    resetRoundState();
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const currentQuestion = currentQuestionIndex !== null ? questions[currentQuestionIndex] : null;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
            Lomba Cerdas Cermat - Babak Final
          </h1>
          <button
            onClick={toggleSound}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors flex items-center"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 animate-scaleIn">
              <h2 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                Konfirmasi Ganti Putaran
              </h2>
              <p className="text-gray-700 mb-4">
                Apakah Anda yakin ingin pindah ke putaran {nextRoundDirection === "next" ? "berikutnya" : "sebelumnya"}? Semua kartu akan direset.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleRoundChange}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Ya, Pindah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Round Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-full max-w-3xl">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <button
                onClick={() => confirmRoundChange("prev")}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentRound === 1}
              >
                <ChevronLeft size={24} />
              </button>
            </div>
            <h2 className="text-center text-3xl font-bold py-4 px-12" style={{ color: PRIMARY_COLOR }}>
              Putaran {currentRound}: {ROUND_TITLES[currentRound]}
            </h2>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <button
                onClick={() => confirmRoundChange("next")}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentRound >= MAX_ROUNDS}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-gray-50 px-5 py-2 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-600">Kartu:</span>
              <span className="font-bold text-lg" style={{ color: PRIMARY_COLOR }}>
                {cardFlipHistory.length}/5
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-5 py-2 rounded-lg border border-gray-200">
              <Clock className="text-gray-600" />
              <span
                className="text-2xl font-mono font-bold"
                style={{ color: timer <= 5 ? "#FF3B30" : PRIMARY_COLOR }}
              >
                {formatTime(timer)}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <label htmlFor="customTimer" className="text-gray-600 font-medium">
              Timer (detik):
            </label>
            <input
              id="customTimer"
              type="number"
              min="1"
              value={customTimerInput}
              onChange={handleCustomTimerChange}
              className="w-20 p-1 border border-gray-300 rounded-md text-center"
              placeholder={DEFAULT_TIMER}
              disabled={timerRunning}
            />
          </div>
          <button
            onClick={startTimer}
            className="px-4 py-2 rounded-md transition-colors font-medium flex items-center"
            style={{
              backgroundColor: timerRunning ? "#FF3B30" : "#34C759",
              color: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            disabled={currentQuestionIndex === null}
          >
            {timerRunning ? "Pause Timer" : "Start Timer"}
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors font-medium"
            disabled={currentQuestionIndex === null}
          >
            Reset Timer
          </button>
          <button
            onClick={shuffleCards}
            className="px-4 py-2 rounded-md transition-colors font-medium flex items-center"
            style={{
              backgroundColor: cards.length === 0 ? "#ccc" : SECONDARY_COLOR,
              color: cards.length === 0 ? "#666" : "#000",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            disabled={cards.length === 0}
          >
            <Shuffle size={18} className="mr-2" />
            Acak Kartu
          </button>
          <button
            onClick={toggleFullScreen}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors font-medium flex items-center"
          >
            {isFullScreen ? <Minimize2 size={18} className="mr-2" /> : <Maximize2 size={18} className="mr-2" />}
            {isFullScreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          </button>
        </div>

        {/* Errors and Loading */}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg max-w-xl mx-auto mb-8">
            <p>{error}</p>
          </div>
        ) : questions.length === 0 && !error ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat soal...</p>
          </div>
        ) : null}

        {/* Card Grid */}
        {currentQuestionIndex === null ? (
          <div
            ref={cardContainerRef}
            className="grid grid-cols-1 sm:grid-cols-5 gap-4 max-w-4xl mx-auto transition-transform duration-300"
          >
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`
                  relative w-40 h-40 rounded-xl shadow-md transform transition-all duration-300
                  ${card.isFlipped ? "cursor-default opacity-50" : "hover:scale-105 hover:shadow-lg cursor-pointer"}
                `}
                disabled={card.isFlipped}
              >
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center p-4 text-center"
                  style={{
                    backgroundColor: card.isFlipped ? "#f5f5f5" : PRIMARY_COLOR,
                    color: card.isFlipped ? "#999" : "white",
                    border: card.isFlipped ? "1px dashed #ccc" : "none",
                  }}
                >
                  {card.isFlipped ? (
                    <span className="text-xl">Sudah Dipilih</span>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-sm opacity-80 mb-1">{card.category}</div>
                      <div className="text-4xl font-bold">{card.cardNumber}</div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Question Display */
          <div className="max-w-3xl mx-auto">
            {showTimerAlert && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 animate-pulse">
                <div className="flex items-center">
                  <Clock className="text-red-500 mr-2" />
                  <p className="text-red-600 font-bold">Waktu Habis!</p>
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl border shadow-md overflow-hidden">
              <div className="p-4 flex items-center justify-between" style={{ backgroundColor: PRIMARY_COLOR, color: "white" }}>
                <div className="flex items-center">
                  <span className="mr-2 font-bold">Kartu #{currentQuestionIndex + 1}</span>
                  <span className="text-white text-opacity-80">({currentQuestion?.category})</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(null);
                      resetTimer();
                    }}
                    className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition-colors"
                  >
                    Kembali ke Kartu
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Pertanyaan:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xl font-medium">
                      {currentQuestion?.question || "Tidak ada pertanyaan tersedia"}
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-700">Jawaban:</h3>
                    <button
                      onClick={toggleAnswer}
                      className="flex items-center px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors"
                    >
                      <Eye size={18} className="mr-1" />
                      {showAnswer ? "Sembunyikan Jawaban" : "Tampilkan Jawaban"}
                    </button>
                  </div>
                  <div
                    className={`bg-gray-50 p-4 rounded-lg border ${showAnswer ? "border-green-200 bg-green-50" : "border-gray-200"}`}
                  >
                    {showAnswer ? (
                      <div className="animate-fadeIn">
                        <p className="text-xl font-medium text-green-700 mb-2">
                          {currentQuestion?.answer || "Tidak ada jawaban tersedia"}
                        </p>
                        {currentQuestion?.explanation && (
                          <div className="mt-4 pt-4 border-t border-green-200">
                            <p className="text-gray-700 italic">
                              <span className="font-medium">Penjelasan: </span>
                              {currentQuestion.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-center py-4">
                        Jawaban tersembunyi. Klik tombol "Tampilkan Jawaban" untuk melihat.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-100 border-t p-4">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          <p>© 2025 Aplikasi Lomba Cerdas Cermat - Babak Final</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
        .shake-animation {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default QuestionDisplayFinal;