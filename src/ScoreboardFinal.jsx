import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import {
	Clock, Trophy, Edit2, Check, X, RotateCcw, RotateCw, Play, Pause, Settings,
	Eye, EyeOff, Save, AlertTriangle, Award, Users, Sun, Moon, Upload, Tv2, MicVocal
} from "lucide-react";
import * as XLSX from "xlsx";
import Papa from 'papaparse'; // Untuk Impor CSV

// --- Theme Context ---
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState(localStorage.getItem("scoreboardTheme") || "light");

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove(theme === "light" ? "dark" : "light");
		root.classList.add(theme);
		localStorage.setItem("scoreboardTheme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

const useTheme = () => useContext(ThemeContext);

// --- Audience View Component ---
const AudienceView = ({ teams, primaryColor }) => (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-12 justify-center items-center">
        <h1 className="text-6xl font-extrabold mb-16" style={{ color: primaryColor }}>
            PAPAN SKOR FINAL - INFORMATIKA CUP II
        </h1>
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {teams
                .sort((a, b) => b.score - a.score)
                .map((team, index) => (
                    <div
                        key={team.id}
                        className={`p-8 rounded-2xl shadow-2xl border-l-8 transition-all duration-500 transform hover:scale-105 ${
                            index === 0
                                ? "border-yellow-400 bg-gray-800"
                                : index === 1
                                ? "border-gray-400 bg-gray-800"
                                : "border-teal-500 bg-gray-800"
                        }`}
                        style={{ backgroundColor: team.color + '20', borderColor: team.color }} // Gunakan warna tim dengan transparansi
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-6xl font-bold" style={{ color: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : team.color }}>
                                #{index + 1}
                            </div>
                           <div className="text-8xl font-bold text-white">
                               {team.score}
                           </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-2 truncate" title={team.name}>
                            {team.name}
                        </h2>
                        <p className="text-2xl text-gray-400 truncate" title={team.school}>
                            {team.school}
                        </p>
                    </div>
                ))}
        </div>
         <footer className="absolute bottom-5 text-gray-500 text-lg">
             © {new Date().getFullYear()} Informatika Cup II
         </footer>
    </div>
);


// --- Main Scoreboard Component ---
const ScoreboardFinal = () => {
	// --- State Variables ---
	const [teams, setTeams] = useState([]);
	const [timer, setTimer] = useState(5);
	const [customTimerInput, setCustomTimerInput] = useState("5");
	const [timerRunning, setTimerRunning] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [scoreHistory, setScoreHistory] = useState([]);
	const [showTimerAlert, setShowTimerAlert] = useState(false);
	const [showWinners, setShowWinners] = useState(false);
	const [editingTeam, setEditingTeam] = useState(null);
	const [showResetConfirm, setShowResetConfirm] = useState(false);
	const [showSaveNotification, setShowSaveNotification] = useState(false);
	const [undoStack, setUndoStack] = useState([]);
	const [redoStack, setRedoStack] = useState([]);
	const [showSettings, setShowSettings] = useState(false);
    const [isAudienceView, setIsAudienceView] = useState(false); // State untuk Audience View
    const { theme, toggleTheme } = useTheme(); // Gunakan theme context

	// --- Refs ---
	const nameInputRef = useRef(null);
	const schoolInputRef = useRef(null);
	const tickSoundRef = useRef(null);
	const timeoutSoundRef = useRef(null);
	const rankingSoundRef = useRef(null);
    const fileInputRef = useRef(null); // Ref untuk input file CSV

	// --- Constants ---
	const PRIMARY_COLOR = "#08636F"; // Teal

	// --- Effects ---

	// Initialize Teams & Load Data
	useEffect(() => {
		const savedData = localStorage.getItem("scoreboardFinalData");
		if (savedData) {
			const parsedData = JSON.parse(savedData);
			setTeams(
				parsedData.teams.map((t, i) => ({
					...t,
					position: i, // Pastikan posisi ada
					isMoving: false,
					color: t.color || "#ffffff",
				}))
			);
			setTimer(parsedData.timer || 5);
			setCustomTimerInput((parsedData.timer || 5).toString());
			setTimerRunning(parsedData.timerRunning || false);
			setScoreHistory(parsedData.scoreHistory || []);
			setUndoStack(parsedData.undoStack || []);
			setRedoStack(parsedData.redoStack || []);
		} else {
            // Data awal jika tidak ada data tersimpan
			const initialTeams = [
				{ id: 1, name: "THE CHAMPIONS PRIMA", school: "Sekolah 1", score: 0, wajib: 0, lemparan: 0, rebutan: 0, penalties: 0, history: [], position: 0, isMoving: false, color: "#E0F7FA" },
                { id: 2, name: "BOEM 1", school: "Sekolah 2", score: 0, wajib: 0, lemparan: 0, rebutan: 0, penalties: 0, history: [], position: 1, isMoving: false, color: "#FFF9C4" },
                { id: 3, name: "THE INTELLECTORS PRIMA", school: "Sekolah 3", score: 0, wajib: 0, lemparan: 0, rebutan: 0, penalties: 0, history: [], position: 2, isMoving: false, color: "#FCE4EC" },
                { id: 4, name: "SMAIDAMAN@1", school: "Sekolah 4", score: 0, wajib: 0, lemparan: 0, rebutan: 0, penalties: 0, history: [], position: 3, isMoving: false, color: "#F1F8E9" },
                { id: 5, name: "PATTIMURA", school: "Sekolah 5", score: 0, wajib: 0, lemparan: 0, rebutan: 0, penalties: 0, history: [], position: 4, isMoving: false, color: "#EDE7F6" },
			];
			setTeams(initialTeams);
			saveData(initialTeams, 5, false, [], [], []);
		}

		// Inisialisasi suara
		tickSoundRef.current = new Audio("/sounds/tick.wav");
		timeoutSoundRef.current = new Audio("/sounds/timeout.wav");
		rankingSoundRef.current = new Audio("/sounds/ranking.mp3");
	}, []);

	// Save Data on Change
	useEffect(() => {
		saveData( teams, timer, timerRunning, scoreHistory, undoStack, redoStack );
	}, [teams, timer, timerRunning, scoreHistory, undoStack, redoStack]);

	// Timer Logic
	useEffect(() => {
		let interval;
		if (timerRunning && timer > 0) {
			interval = setInterval(() => {
				setTimer((prevTime) => {
					if (prevTime <= 1) {
						clearInterval(interval);
						setTimerRunning(false);
						setShowTimerAlert(true);
						timeoutSoundRef.current?.play().catch(console.error);
						return 0;
					}
					tickSoundRef.current?.play().catch(console.error);
					return prevTime - 1;
				});
			}, 1000);
		} else if (timer === 0) {
			setTimerRunning(false);
		}
		return () => clearInterval(interval);
	}, [timerRunning, timer]);

	// Play Ranking Sound
	useEffect(() => {
		if (showWinners && !isAudienceView) { // Hanya mainkan jika di mode normal
			rankingSoundRef.current?.play().catch(console.error);
		} else {
			rankingSoundRef.current?.pause();
			if (rankingSoundRef.current) {
				rankingSoundRef.current.currentTime = 0;
			}
		}
	}, [showWinners, isAudienceView]);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Jangan jalankan shortcut jika sedang mengedit atau di audience view
            if (editingTeam || e.target.tagName === 'INPUT' || isAudienceView) return;

            // Timer: Spasi
            if (e.code === 'Space') {
                e.preventDefault();
                toggleTimer();
            }
            // Undo: Ctrl+Z
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undo();
            }
            // Redo: Ctrl+Y
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                redo();
            }
            // Reset Skor: Ctrl+R (dengan konfirmasi)
             if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                setShowResetConfirm(true);
            }

            // Skor Cepat: Angka 1-5 untuk tim, Q/W/E/A/S/D untuk aksi
            const teamIndex = parseInt(e.key) - 1;
            if (teamIndex >= 0 && teamIndex < teams.length) {
                const teamId = teams.find(t => t.position === teamIndex)?.id;
                if (!teamId) return;

                document.addEventListener('keydown', (nextKey) => {
                    e.preventDefault();
                    switch(nextKey.key.toLowerCase()) {
                        case 'q': updateFinalScore(teamId, "Wajib", 100); break;
                        case 'w': updateFinalScore(teamId, "Lemparan", 50); break;
                        case 'e': updateFinalScore(teamId, "Lemparan", -25); break;
                        case 'a': updateFinalScore(teamId, "Rebutan", 100); break;
                        case 's': updateFinalScore(teamId, "Rebutan", -50); break;
                        case 'd': updateFinalScore(teamId, "Penalti", -25); break;
                        default: break;
                    }
                }, { once: true }); // Hanya dengarkan keydown berikutnya sekali
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [teams, editingTeam, timerRunning, undoStack, redoStack, isAudienceView]); // Tambahkan dependensi


	// --- Functions ---

	const saveData = (teamsData, timerData, timerRunningData, historyData, undoData, redoData) => {
		localStorage.setItem("scoreboardFinalData", JSON.stringify({
				teams: teamsData, timer: timerData, timerRunning: timerRunningData,
				scoreHistory: historyData, undoStack: undoData, redoStack: redoData,
		}));
	};

	const formatTime = (time) => {
		const minutes = Math.floor(time / 60).toString().padStart(2, "0");
		const seconds = (time % 60).toString().padStart(2, "0");
		return `${minutes}:${seconds}`;
	};

    const handleCustomTimerChange = (e) => {
        const value = e.target.value;
        setCustomTimerInput(value);
        // Izinkan input kosong sementara
        if (value === "") {
            setTimer(0);
        } else {
            const seconds = parseInt(value, 10);
            if (!isNaN(seconds) && seconds >= 0) {
                 setTimer(seconds);
                // Hanya reset jika timer tidak berjalan
                 if (!timerRunning) {
                    setTimer(seconds);
                 }
            }
        }
    };


	const handleSetTimer = () => {
		const seconds = parseInt(customTimerInput, 10);
		setTimer(isNaN(seconds) || seconds < 0 ? 5 : seconds);
		setTimerRunning(false);
	};

	const toggleTimer = () => {
		if (!timerRunning && timer === 0) {
			handleSetTimer(); // Jika timer 0, set ulang sebelum mulai
		}
		setTimerRunning(!timerRunning);
	};

	const resetTimer = () => {
		handleSetTimer();
	};

	const closeTimerAlert = () => { setShowTimerAlert(false); resetTimer(); };
	const startEditTeam = (team) => { setEditingTeam({ ...team }); };

	const saveTeamEdit = () => {
		if (!editingTeam) return;
		saveStateForUndo();
		setTeams((prevTeams) =>
			prevTeams.map((team) =>
				team.id === editingTeam.id
					? { ...team, name: editingTeam.name, school: editingTeam.school, color: editingTeam.color }
					: team
			)
		);
		setEditingTeam(null);
	};

	const handleTeamInfoChange = (field, value) => { setEditingTeam((prev) => ({ ...prev, [field]: value })); };
	const cancelTeamEdit = () => setEditingTeam(null);

	const updateTeamPositions = (updatedTeams) => {
		const sortedTeams = [...updatedTeams].sort((a, b) => b.score - a.score);
		setTeams(
			updatedTeams.map((team) => {
				const newIndex = sortedTeams.findIndex((t) => t.id === team.id);
				return { ...team, position: newIndex };
			})
		);
	};

	const saveStateForUndo = () => {
		setUndoStack((prev) => [ ...prev.slice(-9), { teams: JSON.parse(JSON.stringify(teams)), scoreHistory: JSON.parse(JSON.stringify(scoreHistory)) } ]);
		setRedoStack([]);
	};

	const undo = () => {
		if (undoStack.length === 0) return;
		const lastState = undoStack[undoStack.length - 1];
		setRedoStack((prev) => [ ...prev, { teams: JSON.parse(JSON.stringify(teams)), scoreHistory: JSON.parse(JSON.stringify(scoreHistory)) } ]);
		setTeams(lastState.teams);
		setScoreHistory(lastState.scoreHistory);
		setUndoStack((prev) => prev.slice(0, -1));
	};

	const redo = () => {
		if (redoStack.length === 0) return;
		const nextState = redoStack[redoStack.length - 1];
		setUndoStack((prev) => [ ...prev, { teams: JSON.parse(JSON.stringify(teams)), scoreHistory: JSON.parse(JSON.stringify(scoreHistory)) } ]);
		setTeams(nextState.teams);
		setScoreHistory(nextState.scoreHistory);
		setRedoStack((prev) => prev.slice(0, -1));
	};

	const updateFinalScore = (teamId, type, value) => {
		saveStateForUndo();
		setTeams((prevTeams) => {
			const updatedTeams = prevTeams.map((team) => {
				if (team.id === teamId) {
					const newScore = Math.max(0, team.score + value);
					const historyEntry = { timestamp: new Date().toISOString(), teamId, action: value > 0 ? "Tambah" : "Kurang", type, points: value, newTotal: newScore };
					setScoreHistory((prev) => [...prev, historyEntry]);

					const updates = { score: newScore, history: [...team.history, historyEntry] };
					if (type === "Wajib") updates.wajib = (team.wajib || 0) + (value > 0 ? 1 : 0);
					else if (type === "Lemparan") updates.lemparan = (team.lemparan || 0) + (value > 0 ? 1 : 0);
					else if (type === "Rebutan") updates.rebutan = (team.rebutan || 0) + (value > 0 ? 1 : 0);
					else if (type === "Penalti") updates.penalties = (team.penalties || 0) + 1;

					return { ...team, ...updates };
				}
				return team;
			});
			updateTeamPositions(updatedTeams);
			return updatedTeams;
		});
	};

	const confirmReset = () => {
		saveStateForUndo();
		const resetTeams = teams.map((team, index) => ({
			...team, score: 0, wajib: 0, lemparan: 0, rebutan: 0, penalties: 0, history: [], position: index,
		}));
		setTeams(resetTeams);
		setScoreHistory([]);
		resetTimer();
		setShowResetConfirm(false);
	};

	const downloadScoreData = () => {
		const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
		const teamData = sortedTeams.map((team, index) => ({
			Peringkat: index + 1, Tim: team.name, Sekolah: team.school, "Total Skor": team.score,
			"Soal Wajib": team.wajib || 0, "Soal Lemparan": team.lemparan || 0, "Soal Rebutan": team.rebutan || 0,
			Penalti: team.penalties || 0, Warna: team.color,
		}));
		const historyData = scoreHistory.map((entry) => {
			const team = teams.find((t) => t.id === entry.teamId);
			return { Waktu: new Date(entry.timestamp).toLocaleString(), Tim: team?.name || `Tim ${entry.teamId}`,
				Tindakan: entry.action, Kategori: entry.type, Poin: entry.points, "Total Baru": entry.newTotal,
			};
		});

		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamData), "Skor Tim");
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(historyData), "Riwayat Skor");
		XLSX.writeFile(wb, `CCI-Final-${new Date().toISOString().slice(0, 10)}.xlsx`);
		setShowSaveNotification(true);
		setTimeout(() => setShowSaveNotification(false), 3000);
	};

    // --- CSV Import ---
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const importedTeams = results.data.map((row, index) => {
                        const name = row.Tim || row.Name || row.team || `Tim ${index + 1}`;
                        const school = row.Sekolah || row.School || `Sekolah ${index + 1}`;
                        const color = row.Warna || row.Color || `#${Math.floor(Math.random()*16777215).toString(16)}`;

                        return {
                            id: index + 1, // Atau coba cari ID yang cocok jika ada
                            name: name.trim(),
                            school: school.trim(),
                            score: 0, wajib: 0, lemparan: 0, rebutan: 0, penalties: 0,
                            history: [], position: index, isMoving: false, color: color,
                        };
                    });
                    if (importedTeams.length > 0) {
                        if (window.confirm(`Impor ${importedTeams.length} tim? Ini akan MENGGANTI tim saat ini dan MERESET skor. Lanjutkan?`)) {
                           saveStateForUndo(); // Simpan state sebelum ganti
                           setTeams(importedTeams);
                           setScoreHistory([]);
                           resetTimer();
                           alert("Tim berhasil diimpor!");
                        }
                    } else {
                        alert("Tidak ada data tim yang valid ditemukan di file CSV. Pastikan header 'Tim' dan 'Sekolah'.");
                    }
                } catch (error) {
                    console.error("Error parsing CSV:", error);
                    alert("Gagal memproses file CSV. Periksa format dan coba lagi.");
                }
                 // Reset input file agar bisa upload file yang sama lagi
                event.target.value = null;
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                alert("Gagal membaca file CSV.");
                 event.target.value = null;
            }
        });
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

	const ActionButton = ({ onClick, children, className = "", ...props }) => (
		<button onClick={onClick} className={`px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`} {...props}>
			{children}
		</button>
	);

	const ScoreButton = ({ onClick, children, className = "", ...props }) => (
		<button onClick={onClick} className={`px-2 py-1.5 rounded text-xs font-medium transition-transform transform hover:scale-105 shadow-sm hover:shadow-lg ${className}`} {...props}>
			{children}
		</button>
	);

    // Jika Audience View aktif, tampilkan komponennya
    if (isAudienceView) {
        return <AudienceView teams={teams} primaryColor={PRIMARY_COLOR} />;
    }

    // Tampilan Papan Skor Normal
	return (
		<div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white overflow-hidden">
			<header className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
				<div className="container mx-auto flex justify-between items-center">
					<div className="flex items-center space-x-2">
						{/* <img src="/logo.png" alt="Logo" className="h-10 w-10"/> */}
						<h1 className="text-xl font-bold text-gray-800 dark:text-white">
							Papan Skor Final - <span style={{ color: PRIMARY_COLOR }}>Informatika Cup II</span>
						</h1>
					</div>
					<div className="flex flex-wrap gap-2 items-center">
                        <ActionButton onClick={() => setIsAudienceView(!isAudienceView)} className="bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500">
							<Tv2 size={16} className="mr-2" /> Tampilan Penonton
						</ActionButton>
						<ActionButton onClick={undo} disabled={undoStack.length === 0} className="bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-500 focus:ring-gray-500">
							<RotateCcw size={16} className="mr-2" /> Undo
						</ActionButton>
						<ActionButton onClick={redo} disabled={redoStack.length === 0} className="bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-500 focus:ring-gray-500">
							<RotateCw size={16} className="mr-2" /> Redo
						</ActionButton>
						<ActionButton onClick={() => setShowWinners(!showWinners)} className={`text-white ${ showWinners ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400" : "bg-teal-600 hover:bg-teal-700 focus:ring-teal-500" }`}>
							<Award size={16} className="mr-2" /> {showWinners ? "Papan Skor" : "Juara"}
						</ActionButton>
						<ActionButton onClick={downloadScoreData} className="bg-green-600 hover:bg-green-700 text-white focus:ring-green-500">
							<Save size={16} className="mr-2" /> Simpan
						</ActionButton>
						<ActionButton onClick={() => setShowResetConfirm(true)} className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500">
							<RotateCcw size={16} className="mr-2" /> Reset Skor
						</ActionButton>
						<ActionButton onClick={() => setShowHistory(!showHistory)} className="bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500">
							{showHistory ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />} Riwayat
						</ActionButton>
                         <ActionButton onClick={toggleTheme} className="bg-gray-700 text-white hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 focus:ring-gray-400">
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        </ActionButton>
						<ActionButton onClick={() => setShowSettings(!showSettings)} className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 focus:ring-gray-400">
							<Settings size={16} />
						</ActionButton>
					</div>
				</div>
			</header>

			{showSettings && (
				<div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 shadow-inner overflow-hidden">
					<h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center">
						<Settings size={18} className="mr-2" /> Pengaturan
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">Warna Tim:</h4>
                            <div className="flex flex-wrap gap-4 items-center">
                                {teams.map((team) => (
                                    <div key={team.id} className="flex items-center space-x-2">
                                        <label className="font-medium text-sm dark:text-gray-100">{team.name}:</label>
                                        <input type="color" value={team.color || "#ffffff"} onChange={(e) => {
                                                saveStateForUndo();
                                                setTeams((prevTeams) => prevTeams.map((t) =>
                                                        t.id === team.id ? { ...t, color: e.target.value } : t ));
                                            }}
                                            className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-full cursor-pointer shadow-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                             <h4 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">Data Tim:</h4>
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                             <ActionButton onClick={triggerFileUpload} className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500">
                                <Upload size={16} className="mr-2" /> Impor Tim (CSV)
                             </ActionButton>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gunakan header 'Tim' dan 'Sekolah'. Impor akan mengganti data tim saat ini.</p>
                        </div>
                    </div>
				</div>
			)}

			<main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex overflow-hidden">
				<div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col mr-4">
					{showWinners ? (
						<div className="flex-1 flex flex-col items-center justify-center text-center">
							<Trophy size={64} className="mb-6 text-yellow-500" />
							<h2 className="text-4xl font-extrabold mb-8 text-gray-800 dark:text-white">Pemenang Babak Final</h2>
							<div className="flex justify-around w-full max-w-4xl">
								{teams.sort((a, b) => b.score - a.score).slice(0, 3).map((team, index) => (
									<div key={team.id} className={`p-8 rounded-xl shadow-lg text-center border-t-8 ${ index === 0 ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/50" : index === 1 ? "border-gray-400 bg-gray-50 dark:bg-gray-700/50" : "border-orange-400 bg-orange-50 dark:bg-orange-900/50" } flex flex-col items-center w-64 h-72 justify-between`}>
										<div className="text-5xl font-bold mb-3">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
										<div className="mb-4">
											<div className="text-2xl font-bold text-gray-900 dark:text-white">{team.name}</div>
											<div className="text-md text-gray-600 dark:text-gray-300">{team.school}</div>
										</div>
										<div className={`text-4xl font-bold p-3 rounded-lg ${ index === 0 ? "bg-yellow-400 text-white" : index === 1 ? "bg-gray-400 text-white" : "bg-orange-400 text-white" }`}>
											{team.score}
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<>
							<div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
								<h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
									<Users size={24} className="mr-3" style={{ color: PRIMARY_COLOR }} /> Papan Skor Final
								</h2>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Wajib (+100) | Lempar (+50/-25) | Rebut (+100/-50) | Penalti (-25)
								</p>
							</div>
							<div className="flex-1 overflow-y-auto custom-scrollbar"> {/* Tambah custom-scrollbar jika perlu */}
								<table className="w-full bg-white dark:bg-gray-800 text-left">
									<thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
										<tr className="border-b border-gray-200 dark:border-gray-700">
											<th className="py-4 px-6 text-center font-semibold text-gray-600 dark:text-gray-300 w-16">#</th>
											<th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">Tim & Sekolah</th>
											<th className="py-4 px-6 text-center font-semibold text-gray-600 dark:text-gray-300">W</th>
											<th className="py-4 px-6 text-center font-semibold text-gray-600 dark:text-gray-300">L</th>
											<th className="py-4 px-6 text-center font-semibold text-gray-600 dark:text-gray-300">R</th>
											<th className="py-4 px-6 text-center font-semibold text-gray-600 dark:text-gray-300">P</th>
											<th className="py-4 px-6 text-center font-semibold text-gray-600 dark:text-gray-300 text-lg">Skor</th>
											<th className="py-4 px-6 text-center font-semibold text-gray-600 dark:text-gray-300 w-64">Aksi Cepat</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100 dark:divide-gray-700">
										{teams.sort((a, b) => a.position - b.position).map((team) => (
											<tr key={team.id} className={`transition-all duration-500 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 ${ team.position === 0 ? "bg-yellow-50 dark:bg-yellow-900/30" : team.position === 1 ? "bg-gray-100 dark:bg-gray-700/30" : team.position === 2 ? "bg-orange-50 dark:bg-orange-900/30" : "dark:bg-gray-800" }`}>
												<td className="py-4 px-6 text-center">
													<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${ team.position === 0 ? "bg-yellow-500" : team.position === 1 ? "bg-gray-500" : team.position === 2 ? "bg-orange-500" : "bg-teal-600" }`}>
														{team.position + 1}
													</div>
												</td>
												<td className="py-4 px-6">
													{editingTeam?.id === team.id ? (
														<div className="flex items-center space-x-2">
															<input ref={nameInputRef} type="text" className="border border-gray-300 rounded px-2 py-1 w-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editingTeam.name} onChange={(e) => handleTeamInfoChange("name", e.target.value )} autoFocus />
															<input ref={schoolInputRef} type="text" className="border border-gray-300 rounded px-2 py-1 w-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editingTeam.school} onChange={(e) => handleTeamInfoChange("school", e.target.value )} />
														</div>
													) : (
														<div className="flex items-center">
															<div className="w-4 h-4 rounded-full mr-3 border dark:border-gray-600" style={{ backgroundColor: team.color }}></div>
															<div>
																<div className="font-semibold text-gray-800 dark:text-white">{team.name}</div>
																<div className="text-sm text-gray-500 dark:text-gray-400">{team.school}</div>
															</div>
															<button onClick={() => startEditTeam(team)} className="ml-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-50 hover:opacity-100" title="Edit Tim">
																<Edit2 size={16} />
															</button>
														</div>
													)}
												</td>
												<td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">{team.wajib || 0}</td>
												<td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">{team.lemparan || 0}</td>
												<td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">{team.rebutan || 0}</td>
												<td className="py-4 px-6 text-center text-red-600 dark:text-red-500">{team.penalties || 0}</td>
												<td className="py-4 px-6 text-center font-bold text-2xl" style={{ color: PRIMARY_COLOR }}>{team.score}</td>
												<td className="py-4 px-6">
													{editingTeam?.id === team.id ? (
														<div className="flex justify-center space-x-2">
															<button onClick={saveTeamEdit} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600" title="Simpan"><Check size={16} /></button>
															<button onClick={cancelTeamEdit} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600" title="Batal"><X size={16} /></button>
														</div>
													) : (
														<div className="grid grid-cols-3 gap-1.5">
                                                            {/* Ganti warna agar kontras di dark mode */}
															<ScoreButton onClick={() => updateFinalScore(team.id, "Wajib", 100)} className="bg-green-100 text-green-800 hover:bg-green-600 hover:text-white dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-600" title="Wajib (+100)">W +100</ScoreButton>
															<ScoreButton onClick={() => updateFinalScore(team.id, "Lemparan", 50)} className="bg-blue-100 text-blue-800 hover:bg-blue-600 hover:text-white dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-600" title="Lempar (+50)">L +50</ScoreButton>
															<ScoreButton onClick={() => updateFinalScore(team.id, "Lemparan", -25)} className="bg-orange-100 text-orange-800 hover:bg-orange-600 hover:text-white dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-600" title="Lempar (-25)">L -25</ScoreButton>
															<ScoreButton onClick={() => updateFinalScore(team.id, "Rebutan", 100)} className="bg-purple-100 text-purple-800 hover:bg-purple-600 hover:text-white dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-600" title="Rebut (+100)">R +100</ScoreButton>
															<ScoreButton onClick={() => updateFinalScore(team.id, "Rebutan", -50)} className="bg-red-100 text-red-800 hover:bg-red-600 hover:text-white dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-600" title="Rebut (-50)">R -50</ScoreButton>
															<ScoreButton onClick={() => updateFinalScore(team.id, "Penalti", -25)} className="bg-gray-700 text-white hover:bg-black dark:bg-gray-600 dark:hover:bg-black" title="Penalti (-25)">P -25</ScoreButton>
														</div>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</>
					)}
				</div>

				<div className="w-72 flex-shrink-0 flex flex-col space-y-4">
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
						<h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center justify-center">
							<Clock size={20} className="mr-2" style={{ color: PRIMARY_COLOR }} /> Pengatur Waktu
						</h3>
						<div className={`text-7xl font-mono mb-6 p-4 rounded-lg border-4 ${ timerRunning ? "border-green-400" : "border-gray-200 dark:border-gray-600" } ${ timer <= 10 && timer > 0 ? "text-red-500 animate-pulse" : "text-gray-800 dark:text-white" }`}>
							{formatTime(timer)}
						</div>
						<div className="flex items-center space-x-2 mb-4">
							<input type="number" min="0" value={customTimerInput} onChange={handleCustomTimerChange} className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Detik" />
							<button onClick={handleSetTimer} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"> Set </button>
						</div>
						<div className="flex space-x-2">
							<ActionButton onClick={toggleTimer} className={`flex-1 text-white ${ timerRunning ? "bg-red-500 hover:bg-red-600 focus:ring-red-400" : "bg-green-500 hover:bg-green-600 focus:ring-green-400" }`}>
								{timerRunning ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />} {timerRunning ? "Jeda" : "Mulai"}
							</ActionButton>
							<ActionButton onClick={resetTimer} className="bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500">
								<RotateCcw size={18} />
							</ActionButton>
						</div>
					</div>

					<div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-1 flex flex-col overflow-hidden transition-all duration-300 ${ showHistory ? "max-h-[60vh]" : "max-h-24" }`}>
						<button onClick={() => setShowHistory(!showHistory)} className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center justify-between w-full">
							<span> <Eye size={20} className="mr-2 inline" style={{ color: PRIMARY_COLOR }} /> Riwayat Skor </span>
							<span className="text-gray-400">{showHistory ? "▲" : "▼"}</span>
						</button>
						{showHistory && (
							<div className="overflow-y-auto flex-1 custom-scrollbar">
								<ul className="divide-y divide-gray-100 dark:divide-gray-700 pr-2">
									{scoreHistory.slice().reverse().map((entry, index) => {
										const team = teams.find((t) => t.id === entry.teamId);
										return (
											<li key={index} className="py-2.5 text-sm">
												<div className="flex justify-between items-center">
													<span className="font-medium text-gray-800 dark:text-gray-100">{team?.name || `Tim ${entry.teamId}`}</span>
													<span className={`font-bold ${ entry.points > 0 ? "text-green-600" : "text-red-600" }`}>
														{entry.points > 0 ? `+${entry.points}` : entry.points}
													</span>
												</div>
												<div className="text-xs text-gray-500 dark:text-gray-400">
													{entry.type} • {new Date(entry.timestamp).toLocaleTimeString()} → {entry.newTotal}
												</div>
											</li>
										);
									})}
									{scoreHistory.length === 0 && (
										<p className="text-sm text-gray-400 text-center py-4">Belum ada riwayat skor.</p>
									)}
								</ul>
							</div>
						)}
					</div>
				</div>
			</main>

			<footer className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-3 text-center text-xs border-t border-gray-100 dark:border-gray-700">
				© {new Date().getFullYear()} Informatika Cup II - Sistem Papan Skor Modern
			</footer>

            {/* Modals (Disesuaikan untuk Dark Mode) */}
			{showTimerAlert && (
				<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
						<AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
						<h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Waktu Habis!</h2>
						<p className="mb-6 text-gray-600 dark:text-gray-300">Waktu untuk menjawab telah berakhir.</p>
						<ActionButton onClick={closeTimerAlert} className="w-full bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500">
							Tutup & Reset Waktu
						</ActionButton>
					</div>
				</div>
			)}

			{showResetConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full">
						<h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Konfirmasi Reset Skor</h2>
						<p className="mb-6 text-gray-600 dark:text-gray-300">
							Anda yakin ingin mereset semua skor (Wajib, Lemparan, Rebutan, Penalti) untuk semua tim? Nama tim, sekolah, dan warna tidak akan berubah.
						</p>
						<div className="flex justify-end space-x-3">
							<ActionButton onClick={() => setShowResetConfirm(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 focus:ring-gray-400">
								Batal
							</ActionButton>
							<ActionButton onClick={confirmReset} className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">
								Ya, Reset Skor
							</ActionButton>
						</div>
					</div>
				</div>
			)}

			{showSaveNotification && (
				<div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
					<Check size={20} className="mr-2" /> Data berhasil diunduh!
				</div>
			)}
		</div>
	);
};

// Bungkus komponen utama dengan ThemeProvider
const App = () => (
    <ThemeProvider>
        <ScoreboardFinal />
    </ThemeProvider>
);

export default App; // Ekspor App, bukan ScoreboardFinal secara langsung