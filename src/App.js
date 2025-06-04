import React, { useState, useEffect } from 'react';
import ScoreboardSemifinal from './ScoreboardSemifinal';
import ScoreboardFinal from './ScoreboardFinal';
import Timer from './timer';
import QuestionDisplay from './QuestionDisplay';
import QuestionDisplayFinal from './QuestionDisplayFinal';
import './index.css';
import logo from './Logo_Hima.png';

// Warna tema Informatika Cup II 2025
const PRIMARY_COLOR = '#08636F';
const SECONDARY_COLOR = '#FAD800';

function App() {
  const [mode, setMode] = useState(null);
  const [currentRound, setCurrentRound] = useState(1); // Tambahkan state untuk currentRound

  // Tambahkan Poppins font via useEffect
  useEffect(() => {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(linkElement);
    
    document.body.style.fontFamily = "'Poppins', sans-serif";
    
    return () => {
      document.head.removeChild(linkElement);
    };
  }, []);

  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <img 
                src={logo} 
                alt="Informatika Cup Logo" 
                className="h-24 w-auto"
              />
            </div>
            <h1 className="text-4xl font-extrabold mb-2" style={{ color: PRIMARY_COLOR }}>
              LCC IC25 Apps
            </h1>
            <div className="w-16 h-1 mx-auto my-3" style={{ background: SECONDARY_COLOR }}></div>
            <h2 className="text-2xl font-bold text-gray-700">Pilih Mode</h2>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
            <button
              onClick={() => setMode('timer')}
              className="group relative flex items-center justify-center px-6 py-4 rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg"
              style={{ 
                background: 'white',
                border: `2px solid ${PRIMARY_COLOR}`
              }}
            >
              <div className="absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full" 
                   style={{ background: SECONDARY_COLOR, opacity: 0.1 }}></div>
              <div className="relative flex flex-col items-center">
                <span className="text-sm font-semibold" style={{ color: PRIMARY_COLOR }}>Timer</span>
                <span className="h-0.5 w-8 mt-2" style={{ background: PRIMARY_COLOR }}></span>
              </div>
            </button>
            
            <button
              onClick={() => setMode('question')}
              className="group relative flex items-center justify-center px-6 py-4 rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg"
              style={{ 
                background: 'white',
                border: `2px solid ${PRIMARY_COLOR}`
              }}
            >
              <div className="absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full" 
                   style={{ background: SECONDARY_COLOR, opacity: 0.1 }}></div>
              <div className="relative flex flex-col items-center">
                <span className="text-sm font-semibold" style={{ color: PRIMARY_COLOR }}>Soal Semifinal</span>
                <span className="h-0.5 w-8 mt-2" style={{ background: PRIMARY_COLOR }}></span>
              </div>
            </button>
            
            <button
              onClick={() => setMode('questionFinal')}
              className="group relative flex items-center justify-center px-6 py-4 rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg"
              style={{ 
                background: 'white',
                border: `2px solid ${PRIMARY_COLOR}`
              }}
            >
              <div className="absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full" 
                   style={{ background: SECONDARY_COLOR, opacity: 0.1 }}></div>
              <div className="relative flex flex-col items-center">
                <span className="text-sm font-semibold" style={{ color: PRIMARY_COLOR }}>Soal Final</span>
                <span className="h-0.5 w-8 mt-2" style={{ background: PRIMARY_COLOR }}></span>
              </div>
            </button>
            
            <button
              onClick={() => setMode('semifinal')}
              className="group relative flex items-center justify-center px-6 py-4 rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg"
              style={{ 
                background: 'white',
                border: `2px solid ${PRIMARY_COLOR}`
              }}
            >
              <div className="absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full" 
                   style={{ background: SECONDARY_COLOR, opacity: 0.1 }}></div>
              <div className="relative flex flex-col items-center">
                <span className="text-sm font-semibold" style={{ color: PRIMARY_COLOR }}>Papan Skor Semifinal</span>
                <span className="h-0.5 w-8 mt-2" style={{ background: PRIMARY_COLOR }}></span>
              </div>
            </button>
            
            <button
              onClick={() => setMode('final')}
              className="group relative flex items-center justify-center px-6 py-4 rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg"
              style={{ 
                background: 'white',
                border: `2px solid ${PRIMARY_COLOR}`
              }}
            >
              <div className="absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full" 
                   style={{ background: SECONDARY_COLOR, opacity: 0.1 }}></div>
              <div className="relative flex flex-col items-center">
                <span className="text-sm font-semibold" style={{ color: PRIMARY_COLOR }}>Papan Skor Final</span>
                <span className="h-0.5 w-8 mt-2" style={{ background: PRIMARY_COLOR }}></span>
              </div>
            </button>
          </div>
          
          {/* Footer */}
          <div className="mt-12 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">© Informatika Cup II 2025</p>
          </div>
        </div>
      </div>
    );
  }

  // Return the appropriate component based on mode
  if (mode === 'semifinal') return <ScoreboardSemifinal />;
  if (mode === 'final') return <ScoreboardFinal />;
  if (mode === 'timer') return <Timer />;
  if (mode === 'question') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setCurrentRound(1)}
            className={`px-4 py-2 rounded-md font-medium ${currentRound === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Sesi 1
          </button>
          <button
            onClick={() => setCurrentRound(2)}
            className={`px-4 py-2 rounded-md font-medium ${currentRound === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Sesi 2
          </button>
          <button
            onClick={() => setCurrentRound(3)}
            className={`px-4 py-2 rounded-md font-medium ${currentRound === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Sesi 3
          </button>
        </div>
        <QuestionDisplay
          currentRound={currentRound}
          setCurrentRound={setCurrentRound}
          teams={[]}
          updateSemiScore={() => {}}
        />
      </div>
    );
  }
  if (mode === 'questionFinal') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <QuestionDisplayFinal
          teams={[]}
          updateFinalScore={() => {}}
        />
      </div>
    );
  }
  
  return null; // Fallback
}

export default App;