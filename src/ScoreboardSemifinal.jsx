import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, RefreshCw, Award, Clock, Download, Edit2, Check, X, Users, RotateCcw, RotateCw } from 'lucide-react';
import * as XLSX from 'xlsx';

const ScoreboardSemifinal = () => {
  const [teams, setTeams] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [timer, setTimer] = useState(15); // Changed to start at 15
  const [timerRunning, setTimerRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [showTimerAlert, setShowTimerAlert] = useState(false);
  const [showWinners, setShowWinners] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showSessionConfirm, setShowSessionConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showChangeSessionConfirm, setShowChangeSessionConfirm] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const nameInputRef = useRef(null);
  const schoolInputRef = useRef(null);
  const tickSoundRef = useRef(null);
  const timeoutSoundRef = useRef(null);
  const rankingSoundRef = useRef(null);

  const PRIMARY_COLOR = '#08636F';
  const SECONDARY_COLOR = '#FAD800';

  // Initialize teams for semifinal (8 teams)
  const initializeTeams = () => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Tim ${i + 1}`,
      school: `Sekolah ${i + 1}`,
      score: 0,
      members: ['Anggota 1', 'Anggota 2', 'Anggota 3'],
      currentMember: 0,
      session1: 0,
      session2: 0,
      session3: 0,
      history: [],
      position: i,
      isMoving: false,
    }));
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('scoreboardSemifinalData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setTeams(parsedData.teams);
      setCurrentRound(parsedData.currentRound);
      setTimer(parsedData.timer || 15); // Ensure timer starts at 15 if undefined
      setTimerRunning(parsedData.timerRunning);
      setScoreHistory(parsedData.scoreHistory);
    } else {
      const initialTeams = initializeTeams();
      setTeams(initialTeams);
      localStorage.setItem(
        'scoreboardSemifinalData',
        JSON.stringify({
          teams: initialTeams,
          currentRound: 1,
          timer: 15,
          timerRunning: false,
          scoreHistory: [],
        })
      );
    }

    // Initialize audio elements
    tickSoundRef.current = new Audio('/sounds/tick.wav');
    timeoutSoundRef.current = new Audio('/sounds/timeout.wav');
    rankingSoundRef.current = new Audio('/sounds/ranking.mp3');
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    const data = {
      teams,
      currentRound,
      timer,
      timerRunning,
      scoreHistory,
    };
    localStorage.setItem('scoreboardSemifinalData', JSON.stringify(data));
  }, [teams, currentRound, timer, timerRunning, scoreHistory]);

  // Timer logic (countdown from 15 seconds)
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

  // Play ranking sound when showing winners
  useEffect(() => {
    if (showWinners) {
      rankingSoundRef.current.play().catch((e) => console.error('Error playing ranking sound:', e));
    }
  }, [showWinners]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const closeTimerAlert = () => {
    setShowTimerAlert(false);
    setTimer(15); // Reset to 15
  };

  const toggleTimer = () => {
    if (!timerRunning && timer === 0) {
      setTimer(15); // Reset to 15 when starting from 0
    }
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimer(15);
    setTimerRunning(false);
  };

  const startEditTeam = (team) => {
    setEditingTeam({ ...team });
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 50);
  };

  const saveTeamEdit = () => {
    if (!editingTeam) return;
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === editingTeam.id
          ? { ...team, name: editingTeam.name, school: editingTeam.school }
          : team
      )
    );
    setEditingTeam(null);
  };

  const cancelTeamEdit = () => {
    setEditingTeam(null);
  };

  const handleTeamInfoChange = (field, value) => {
    setEditingTeam((prev) => ({ ...prev, [field]: value }));
  };

  const updateTeamPositions = (updatedTeams) => {
    const sortedTeams = [...updatedTeams].sort((a, b) => b.score - a.score);
    const teamsToAnimate = [];

    sortedTeams.forEach((team, newIndex) => {
      const oldTeam = updatedTeams.find((t) => t.id === team.id);
      if (oldTeam && oldTeam.position !== newIndex) {
        teamsToAnimate.push(team.id);
      }
    });

    if (teamsToAnimate.length > 0) {
      setTeams((prevTeams) => {
        const updated = prevTeams.map((team) => {
          const newPosition = sortedTeams.findIndex((t) => t.id === team.id);
          return { ...team, position: newPosition, isMoving: teamsToAnimate.includes(team.id) };
        });
        return updated;
      });

      setTimeout(() => {
        setTeams((prevTeams) => prevTeams.map((team) => ({ ...team, isMoving: false })));
      }, 1000);
    } else {
      setTeams(sortedTeams.map((team, index) => ({ ...team, position: index })));
    }
  };

  const saveStateForUndo = () => {
    setUndoStack((prev) => [
      ...prev,
      {
        teams: JSON.parse(JSON.stringify(teams)),
        scoreHistory: JSON.parse(JSON.stringify(scoreHistory)),
      },
    ]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [
      ...prev,
      {
        teams: JSON.parse(JSON.stringify(teams)),
        scoreHistory: JSON.parse(JSON.stringify(scoreHistory)),
      },
    ]);
    setTeams(lastState.teams);
    setScoreHistory(lastState.scoreHistory);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [
      ...prev,
      {
        teams: JSON.parse(JSON.stringify(teams)),
        scoreHistory: JSON.parse(JSON.stringify(scoreHistory)),
      },
    ]);
    setTeams(nextState.teams);
    setScoreHistory(nextState.scoreHistory);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const updateSemiScore = (teamId, session, value) => {
    saveStateForUndo();
    setTeams((prevTeams) => {
      const updatedTeams = prevTeams.map((team) => {
        if (team.id === teamId) {
          const sessionKey = `session${session}`;
          const newSessionScore = Math.max(0, Math.min(50, team[sessionKey] + value));
          const newScore = team.score + value;

          const historyEntry = {
            timestamp: new Date().toISOString(),
            teamId,
            action: value > 0 ? 'Tambah Skor' : 'Kurang Skor',
            session,
            points: value,
            newTotal: newScore,
          };

          setScoreHistory((prev) => [...prev, historyEntry]);

          return {
            ...team,
            [sessionKey]: newSessionScore,
            score: Math.max(0, newScore),
            history: [...team.history, historyEntry],
          };
        }
        return team;
      });

      updateTeamPositions(updatedTeams);
      return updatedTeams;
    });
  };

  const resetScores = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    const resetTeams = teams.map((team, index) => ({
      ...team,
      score: 0,
      session1: 0,
      session2: 0,
      session3: 0,
      history: [],
      position: index,
      isMoving: false,
    }));

    setTeams(resetTeams);
    setScoreHistory([]);
    setUndoStack([]);
    setRedoStack([]);
    setTimer(15);
    setTimerRunning(false);
    setShowTimerAlert(false);
    setShowResetConfirm(false);
    setCurrentRound(1);

    localStorage.setItem(
      'scoreboardSemifinalData',
      JSON.stringify({
        teams: resetTeams,
        currentRound: 1,
        timer: 15,
        timerRunning: false,
        scoreHistory: [],
      })
    );
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const nextSession = () => {
    if (currentRound < 3) {
      setShowChangeSessionConfirm(true);
    } else {
      setShowSessionConfirm(true);
    }
  };

  const confirmChangeSession = () => {
    setCurrentRound(currentRound + 1);
    setShowChangeSessionConfirm(false);
  };

  const cancelChangeSession = () => {
    setShowChangeSessionConfirm(false);
  };

  const confirmNewRound = () => {
    const resetTeams = teams.map((team, index) => ({
      ...team,
      score: 0,
      session1: 0,
      session2: 0,
      session3: 0,
      history: [],
      position: index,
      isMoving: false,
    }));

    setTeams(resetTeams);
    setScoreHistory([]);
    setUndoStack([]);
    setRedoStack([]);
    setTimer(15);
    setTimerRunning(false);
    setShowTimerAlert(false);
    setCurrentRound(1);
    setShowSessionConfirm(false);

    localStorage.setItem(
      'scoreboardSemifinalData',
      JSON.stringify({
        teams: resetTeams,
        currentRound: 1,
        timer: 15,
        timerRunning: false,
        scoreHistory: [],
      })
    );
  };

  const cancelNewRound = () => {
    setShowSessionConfirm(false);
  };

  const downloadScoreData = () => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

    const wb = XLSX.utils.book_new();

    const teamData = sortedTeams.map((team, index) => ({
      Peringkat: index + 1,
      Tim: team.name,
      Sekolah: team.school,
      'Total Skor': team.score,
      'Sesi 1': team.session1,
      'Sesi 2': team.session2,
      'Sesi 3': team.session3,
    }));

    const teamWs = XLSX.utils.json_to_sheet(teamData);
    XLSX.utils.book_append_sheet(wb, teamWs, 'Skor Tim');

    const historyData = scoreHistory.map((entry) => {
      const team = teams.find((t) => t.id === entry.teamId);
      return {
        Waktu: new Date(entry.timestamp).toLocaleString(),
        Tim: team?.name || `Tim ${entry.teamId}`,
        Tindakan: entry.action,
        Kategori: `Sesi ${entry.session}`,
        Poin: entry.points,
        'Total Baru': entry.newTotal,
      };
    });

    const historyWs = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(wb, historyWs, 'Riwayat Skor');

    XLSX.writeFile(wb, `cerdas-cermat-informatika-semifinal-${new Date().toISOString().slice(0, 10)}.xlsx`);

    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden">
      <header className="text-white p-4" style={{ backgroundColor: PRIMARY_COLOR }}>
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-center">Papan Skor Cerdas Cermat Informatika Cup II 2025 - Semifinal</h1>
        </div>
      </header>

      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 p-2 rounded-lg">
              <Clock className="mr-2 text-gray-600" />
              <span className="text-2xl font-mono">{formatTime(timer)}</span>
            </div>
            <button
              onClick={toggleTimer}
              className={`px-3 py-1 rounded-md transition-colors ${
                timerRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-700 text-white'
              }`}
            >
              {timerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
              <span className="font-semibold mr-2">Sesi: {currentRound}/3</span>
              <button
                onClick={nextSession}
                className="text-white px-3 py-1 rounded-md flex items-center transition-colors"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                <RefreshCw size={16} className="mr-1" /> Ganti Sesi
              </button>
            </div>
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className={`px-3 py-1 rounded-md transition-colors flex items-center ${
                undoStack.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <RotateCcw size={16} className="mr-1" /> Undo
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className={`px-3 py-1 rounded-md transition-colors flex items-center ${
                redoStack.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <RotateCw size={16} className="mr-1" /> Redo
            </button>
            <button
              onClick={resetScores}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors"
            >
              Reset Skor
            </button>
            <button
              onClick={downloadScoreData}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center transition-colors"
            >
              <Download size={16} className="mr-1" /> Simpan Data
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-1 rounded-md transition-colors ${
                showHistory ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
              }`}
            >
              {showHistory ? 'Tutup Riwayat' : 'Lihat Riwayat'}
            </button>
            <button
              onClick={() => setShowWinners(!showWinners)}
              className={`px-3 py-1 rounded-md transition-colors flex items-center`}
              style={{ backgroundColor: showWinners ? SECONDARY_COLOR : 'rgb(209 213 219)', color: showWinners ? '#000' : '#333' }}
            >
              <Award size={16} className="mr-1" /> {showWinners ? 'Sembunyikan Peringkat' : 'Tampilkan Peringkat'}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 pb-8 overflow-y-auto">
        {showWinners ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center" style={{ color: PRIMARY_COLOR }}>
              <Award size={24} className="mr-2" /> Peringkat Semifinal
            </h2>
            <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {teams
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((team, index) => (
                  <div
                    key={team.id}
                    className="p-4 rounded-lg text-center transition-all transform hover:scale-105 bg-gray-50 border border-gray-200"
                  >
                    <div className="text-xl font-bold mb-2">Peringkat {index + 1}</div>
                    <div className="text-lg font-semibold">{team.name}</div>
                    <div className="text-sm text-gray-600">{team.school}</div>
                    <div className="mt-2 text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
                      {team.score} Poin
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
              <h2 className="text-xl font-bold flex items-center">
                <Users size={20} className="mr-2" /> Babak Semifinal - Sesi {currentRound}
              </h2>
              <p className="text-sm">Skor maksimum per sesi: 300 poin (10 soal × 10 poin)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="py-3 px-4 text-center w-12">Peringkat</th>
                    <th className="py-3 px-4 text-left">Tim</th>
                    <th className="py-3 px-4 text-left">Sekolah</th>
                    <th className="py-3 px-4 text-center">Sesi 1</th>
                    <th className="py-3 px-4 text-center">Sesi 2</th>
                    <th className="py-3 px-4 text-center">Sesi 3</th>
                    <th className="py-3 px-4 text-center font-bold">Total</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {teams
                    .sort((a, b) => b.score - a.score)
                    .map((team, index) => (
                      <tr
                        key={team.id}
                        className={`${index < 5 ? 'bg-green-50' : ''} transition-all duration-1000 ease-in-out`}
                        style={{
                          transform: team.isMoving ? `translateY(${(team.position - index) * 56}px)` : 'none',
                        }}
                      >
                        <td className="py-3 px-4 border-b border-gray-100 text-center">{index + 1}</td>
                        <td className="py-3 px-4 font-medium border-b border-gray-100">
                          {editingTeam && editingTeam.id === team.id ? (
                            <input
                              ref={nameInputRef}
                              type="text"
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                              value={editingTeam.name}
                              onChange={(e) => handleTeamInfoChange('name', e.target.value)}
                            />
                          ) : (
                            <div className="flex items-center">
                              {team.name}
                              <button
                                onClick={() => startEditTeam(team)}
                                className="ml-2 text-gray-500 hover:text-blue-600"
                                title="Edit nama tim"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-100">
                          {editingTeam && editingTeam.id === team.id ? (
                            <input
                              ref={schoolInputRef}
                              type="text"
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                              value={editingTeam.school}
                              onChange={(e) => handleTeamInfoChange('school', e.target.value)}
                            />
                          ) : (
                            <div className="flex items-center">
                              {team.school}
                              <button
                                onClick={() => startEditTeam(team)}
                                className="ml-2 text-gray-500 hover:text-blue-600"
                                title="Edit nama sekolah"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center border-b border-gray-100">{team.session1}</td>
                        <td className="py-3 px-4 text-center border-b border-gray-100">{team.session2}</td>
                        <td className="py-3 px-4 text-center border-b border-gray-100">{team.session3}</td>
                        <td className="py-3 px-4 text-center font-bold text-lg border-b border-gray-100">{team.score}</td>
                        <td className="py-3 px-4 border-b border-gray-100">
                          {editingTeam && editingTeam.id === team.id ? (
                            <div className="flex justify-center space-x-1">
                              <button
                                onClick={saveTeamEdit}
                                className="bg-green-500 text-white p-1 rounded-full"
                                title="Simpan"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={cancelTeamEdit}
                                className="bg-red-500 text-white p-1 rounded-full"
                                title="Batal"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => updateSemiScore(team.id, currentRound, 10)}
                                className="text-white p-1 rounded-md transition-transform hover:scale-110"
                                style={{ backgroundColor: '#4CAF50' }}
                                title="Tambah 10 poin (jawaban benar)"
                              >
                                <Plus size={18} />
                              </button>
                              <button
                                onClick={() => updateSemiScore(team.id, currentRound, -10)}
                                className="bg-red-500 text-white p-1 rounded-md transition-transform hover:scale-110"
                                title="Kurang 10 poin (jawaban salah)"
                              >
                                <Minus size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-blue-50 border-t border-blue-100">
              <div className="flex justify-between items-center text-sm" style={{ color: PRIMARY_COLOR }}>
                <span>
                  <Award size={16} className="inline mr-1" /> 5 Tim teratas (background hijau) akan lolos ke babak Final
                </span>
                <span>Jika seri, diadakan babak tambahan 3 soal </span>
              </div>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
              <h2 className="text-xl font-bold">Riwayat Perubahan Skor</h2>
            </div>

            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full bg-white">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="py-2 px-4 text-left">Waktu</th>
                    <th className="py-2 px-4 text-left">Tim</th>
                    <th className="py-2 px-4 text-left">Tindakan</th>
                    <th className="py-2 px-4 text-left">Kategori</th>
                    <th className="py-2 px-4 text-right">Poin</th>
                    <th className="py-2 px-4 text-right">Total Baru</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreHistory
                    .slice()
                    .reverse()
                    .map((entry, index) => {
                      const team = teams.find((t) => t.id === entry.teamId);
                      return (
                        <tr
                          key={index}
                          className={entry.points > 0 ? 'bg-green-50' : entry.points < 0 ? 'bg-red-50' : ''}
                        >
                          <td className="py-2 px-4 text-sm border-b border-gray-100">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-100">{team?.name || `Tim ${entry.teamId}`}</td>
                          <td className="py-2 px-4 border-b border-gray-100">{entry.action}</td>
                          <td className="py-2 px-4 border-b border-gray-100">Sesi {entry.session}</td>
                          <td
                            className={`py-2 px-4 text-right border-b border-gray-100 ${
                              entry.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {entry.points > 0 ? `+${entry.points}` : entry.points}
                          </td>
                          <td className="py-2 px-4 text-right font-medium border-b border-gray-100">
                            {entry.newTotal}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showTimerAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                Waktu Habis!
              </h2>
              <p className="mb-4">Waktu untuk berpikir telah habis!</p>
              <button
                onClick={closeTimerAlert}
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {showSessionConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                Sesi Selesai
              </h2>
              <p className="mb-4">Apakah Anda ingin memulai babak baru? Nama tim dan sekolah akan tetap dipertahankan.</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelNewRound}
                  className="px-4 py-2 rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={confirmNewRound}
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  Mulai Babak Baru
                </button>
              </div>
            </div>
          </div>
        )}

        {showChangeSessionConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                Konfirmasi Ganti Sesi
              </h2>
              <p className="mb-4">Apakah Anda yakin ingin pindah ke Sesi {currentRound + 1}?</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelChangeSession}
                  className="px-4 py-2 rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={confirmChangeSession}
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  Ganti Sesi
                </button>
              </div>
            </div>
          </div>
        )}

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                Konfirmasi Reset Skor
              </h2>
              <p className="mb-4">Apakah Anda yakin ingin mereset semua skor? Tindakan ini tidak akan mengubah nama tim dan sekolah.</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelReset}
                  className="px-4 py-2 rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={confirmReset}
                  className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {showSaveNotification && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
            Data berhasil disimpan!
          </div>
        )}
      </main>

      <footer className="bg-white text-black">
        <div className=" p-5 text-center">
          <p className="text-md text-gray-500 ">
            © Informatika Cup II 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ScoreboardSemifinal;