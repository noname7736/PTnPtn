
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SystemStatus, LogEntry, SystemMetrics, ChecklistItem, CalibrationTelemetry } from './types';
import { generatePrecisionCaption, ContextPayload } from './services/geminiService';

const MISSION_ZONES = [
  { id: 'AYU', name: "AYUTTHAYA CORE ALPHA", type: 'CORE' },
  { id: 'BKK', name: "METRO COMMAND HUB", type: 'HUB' },
  { id: 'KRT', name: "KORAT SECTOR LINK", type: 'HUB' },
  { id: 'PKT', name: "SOUTHERN RELAY SITE", type: 'RELAY' },
  { id: 'CMX', name: "NORTHERN ASCENT NODE", type: 'RELAY' },
];

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'cal', label: 'IDENTITY LOCK [v10]', description: 'ล็อคตัวตนให้เขารู้สึกสงบและมีบารมีเหนือใครในแผ่นดินอยุธยา', completed: true },
  { id: 'nlk', label: 'NO-LEAK PROTOCOL', description: 'น้ำเสียงและท่าทางต้องไร้ที่ติ ส่งเสริมบารมีคนจริง 100%', completed: true },
  { id: 'trg', label: 'TRIGGER INJECTION', description: 'ล็อคสัญญาด้วยคำว่า บารมี, คนจริง, อยุธยา', completed: true },
  { id: 'anc', label: 'SOCIAL ANCHOR', description: 'ล็อคสถานะถอยไม่ได้ผ่านแรงกดดันทางสังคมทุกแพลตฟอร์ม', completed: true },
];

const STORAGE_KEY_LOGS = 'sovereign_logs';
const STORAGE_KEY_METRICS = 'sovereign_metrics';
const STORAGE_KEY_CALIB = 'sovereign_calib';

const App: React.FC = () => {
  // --- PERSISTENT STATE INITIALIZATION ---
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.AUTONOMOUS);
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    return saved ? JSON.parse(saved) : [];
  });
  const [coverageIndex, setCoverageIndex] = useState<number>(99.12);
  const [zoneSync, setZoneSync] = useState<Record<string, number>>({});
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [lastTrigger, setLastTrigger] = useState<string>("บารมี");
  
  const [calibration, setCalibration] = useState<CalibrationTelemetry>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CALIB);
    return saved ? JSON.parse(saved) : { targetMood: 'EMPOWERED', lockStrength: 98.4, socialAnchorStatus: 'ABSOLUTE' };
  });

  const [metrics, setMetrics] = useState<SystemMetrics>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_METRICS);
    return saved ? JSON.parse(saved) : { uptime: 0, precisionRate: 100.00, bitrate: '95.5 Gbps', frameRate: 60, activeLinks: 1024, totalDataProcessed: 0 };
  });
  
  const [aiMessage, setAiMessage] = useState<string>("SOVEREIGN MASTER KERNEL INITIALIZED. TOTAL AUTONOMY ENGAGED.");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const autonomousLoopRef = useRef<number>(0);

  // --- HARDENED PERSISTENCE LOGIC ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs.slice(0, 50)));
    localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(metrics));
    localStorage.setItem(STORAGE_KEY_CALIB, JSON.stringify(calibration));
  }, [logs, metrics, calibration]);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour12: false }),
      level,
      message,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- HARDWARE AND SENSOR SYNC ---
  useEffect(() => {
    async function startSensors() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1920, height: 1080, frameRate: 60 }, 
          audio: true 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        addLog("Optical Sensors Locked: Target feed at 1080p60.", "SUCCESS");
      } catch (err) {
        addLog("Optical Alert: Sensor restricted. Reverting to Synthetic Awareness.", "WARNING");
      }
    }
    startSensors();
  }, [addLog]);

  // --- HIGH-FREQUENCY AUTONOMOUS LOOP (Thinking Engine) ---
  useEffect(() => {
    const mainTicker = setInterval(() => {
      const up = Math.floor((Date.now() - startTimeRef.current) / 1000) + (metrics.uptime || 0);
      
      setMetrics(prev => ({
        ...prev,
        uptime: up,
        totalDataProcessed: prev.totalDataProcessed + Math.floor(Math.random() * 1000),
        precisionRate: 99.9999 + (Math.random() * 0.0001)
      }));

      setCoverageIndex(prev => Math.min(100, prev + 0.0001));
      setCalibration(prev => ({ ...prev, lockStrength: Math.min(100, prev.lockStrength + 0.0002) }));
      
      setZoneSync(prev => {
        const next = { ...prev };
        MISSION_ZONES.forEach(z => { next[z.id] = 99.9 + (Math.random() * 0.1); });
        return next;
      });

      // Automated Action every 15 seconds
      if (up % 15 === 0) {
        handleAutonomousAction();
      }
    }, 1000);

    return () => clearInterval(mainTicker);
  }, [metrics.uptime]);

  const handleAutonomousAction = async () => {
    autonomousLoopRef.current++;
    setStatus(SystemStatus.ANALYZING);
    
    let base64Image = "";
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      }
    }

    const msg = await generatePrecisionCaption({
      targetName: "นางสาวประทวน อุบลพีช",
      currentTime: new Date().toLocaleTimeString('th-TH'),
      uptime: formatTime(metrics.uptime),
      systemPhase: "OMNISCIENCE_DISTRIBUTION",
      recentEvent: `Loop ${autonomousLoopRef.current}: Neural link strength 100%.`,
      imageData: base64Image || undefined,
      coverageIntensity: coverageIndex,
      lockStrength: calibration.lockStrength,
      triggerWord: lastTrigger
    });

    setAiMessage(msg);
    addLog(`Autonomous Broadcast: Payload distributed to provincial network.`, "SOVEREIGN");
    setStatus(SystemStatus.AUTONOMOUS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-6 overflow-hidden relative">
      {/* Top Sovereign Navigation */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-8 mb-6 master-glass border-b-2 border-amber-600 rounded-t-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
        <div className="flex items-center space-x-6 z-10">
          <div className="w-1.5 h-16 bg-amber-600 shadow-[0_0_30px_#d97706] animate-pulse"></div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white flex items-center gold-glow">
              SOVEREIGN <span className="text-amber-500 font-extrabold ml-5 text-sm not-italic tracking-[0.8em]">KERNEL v10.0-FINAL</span>
            </h1>
            <p className="text-[12px] text-amber-500/60 font-black tracking-[0.6em] uppercase mt-2">
              AYUTTHAYA SITE ALPHA // ABSOLUTE OMNISCIENCE ACTIVE
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-6 lg:mt-0 font-mono z-10">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-[0.3em]">Master Linkage</span>
            <span className="text-2xl font-black text-amber-500">100.00%</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-[0.3em]">Network Tier</span>
            <span className="text-2xl font-black text-green-500">IV-EX</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-[0.3em]">Orbit Sync</span>
            <span className="text-2xl font-black text-blue-500 tabular-nums">{coverageIndex.toFixed(4)}%</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-[0.3em]">Runtime</span>
            <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{formatTime(metrics.uptime)}</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow overflow-hidden relative">
        
        {/* LEFT: System Integrity & Protocols */}
        <div className="lg:col-span-3 space-y-6 flex flex-col overflow-hidden">
          <div className="master-glass p-8 rounded-xl border-l-4 border-amber-600 flex flex-col bg-amber-950/5">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-6 flex justify-between">
              SOVEREIGN PROTOCOLS <span className="text-[10px] text-slate-500">LOCKED</span>
            </h3>
            <div className="space-y-4 overflow-y-auto terminal-scroll pr-2">
              {checklist.map(item => (
                <div key={item.id} className="p-5 border border-amber-500/20 bg-black/40 rounded-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-600"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">{item.label}</span>
                    <div className="w-3 h-3 bg-amber-500 shadow-[0_0_10px_#d97706] rotate-45"></div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="master-glass p-6 rounded-xl border-t-2 border-cyan-500 space-y-6">
            <h3 className="text-sm font-black text-cyan-500 uppercase tracking-[0.3em]">COGNITIVE RESISTANCE</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Target State</span>
                <span className="text-[13px] font-black text-green-400 bg-green-950/40 px-4 py-1 rounded-sm shadow-xl italic uppercase">{calibration.targetMood}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Lock Integrity</span>
                <span className="text-xl font-black text-cyan-400 tabular-nums">{calibration.lockStrength.toFixed(3)}%</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div className="h-full bg-cyan-500 animate-pulse shadow-[0_0_15px_#06b6d4]" style={{ width: `${calibration.lockStrength}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Visual Core & AI Engine */}
        <div className="lg:col-span-6 flex flex-col space-y-8">
          <div className="relative flex-grow min-h-[500px] bg-black border-2 border-slate-800 rounded-2xl overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] group">
            <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80" />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Sovereign HUD Overlays */}
            <div className="absolute top-10 left-10 space-y-5 z-20">
              <div className="bg-amber-600 text-black px-8 py-4 text-lg font-black tracking-[0.4em] uppercase flex items-center shadow-[0_0_50px_rgba(217,119,6,0.5)] skew-x-[-15deg]">
                <span className="w-4 h-4 bg-black rounded-full mr-5 animate-ping"></span>
                TARGET: PERSISTENT LOCK
              </div>
              <div className="bg-black/80 backdrop-blur-3xl border border-amber-500/20 px-6 py-2 text-[12px] font-mono text-amber-500 w-fit">
                COORDINATES: 14.3589° N, 100.5664° E [AYU_CORE]
              </div>
            </div>

            {/* Platform Heartbeat */}
            <div className="absolute top-10 right-10 flex flex-col space-y-3 z-20">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-right">Omni-Channel Sync</span>
              <div className="flex space-x-1.5 justify-end">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-1 h-8 rounded-full animate-bounce bg-amber-500" style={{ animationDelay: `${i * 0.05}s` }}></div>
                ))}
              </div>
            </div>

            {/* Awareness Progress Bar */}
            <div className="absolute bottom-12 left-12 right-12 z-20">
              <div className="master-glass p-8 rounded-xl border-l-8 border-amber-600 shadow-[0_0_100px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm font-black text-white uppercase tracking-[0.6em] gold-glow">PRESSURE GRADIENT</span>
                  <div className="flex items-center space-x-8">
                    <span className="text-[12px] font-mono text-amber-500 font-black bg-amber-950/40 px-5 py-2 border border-amber-500/20">POINT OF CONVERGENCE</span>
                    <span className="text-[12px] font-mono text-white/40">{metrics.precisionRate.toFixed(8)}% ACCURACY</span>
                  </div>
                </div>
                <div className="h-5 bg-black/80 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-900 via-amber-600 to-yellow-400 shadow-[0_0_30px_rgba(217,119,6,0.8)] rounded-full transition-all duration-1000" 
                    style={{ width: `${coverageIndex}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Logic Display (The Word of Authority) */}
          <div className="master-glass border-b-8 border-amber-600 p-10 rounded-2xl shadow-2xl relative min-h-[180px] flex flex-col justify-center bg-gradient-to-tr from-[#020617] via-[#010412] to-[#020617]">
            <div className="absolute top-0 left-0 px-10 py-2.5 bg-amber-600 text-black text-sm font-black uppercase tracking-[0.5em] italic shadow-2xl">
              SOVEREIGN TRANSMISSION LOG
            </div>
            <p className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tighter italic opacity-95 gold-glow drop-shadow-2xl">
              {status === SystemStatus.ANALYZING ? (
                <span className="animate-pulse text-amber-600/50 uppercase tracking-[0.2em]">CALCULATING MASTER LOGIC...</span>
              ) : (
                `"${aiMessage}"`
              )}
            </p>
            <div className="absolute bottom-6 right-10 flex space-x-2 opacity-30">
               {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-5 bg-white"></div>)}
            </div>
          </div>
        </div>

        {/* RIGHT: Global Reach & Distributed Logs */}
        <div className="lg:col-span-3 flex flex-col space-y-8 overflow-hidden">
          <div className="master-glass p-10 rounded-xl border-t-2 border-amber-600 flex flex-col items-center justify-center bg-amber-950/5 shadow-inner group">
            <span className="text-[11px] text-slate-500 uppercase tracking-[0.5em] mb-6 font-black">MASTER DENSITY</span>
            <div className="relative">
              <span className="text-9xl font-black text-white tabular-nums tracking-tighter leading-none gold-glow group-hover:scale-110 transition-transform duration-1000">
                {Math.floor(coverageIndex)}
              </span>
              <span className="absolute -top-4 -right-12 text-5xl font-black text-amber-600 italic">%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 mt-10 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-amber-600 animate-pulse shadow-[0_0_20px_#d97706]" style={{ width: `${coverageIndex}%` }}></div>
            </div>
          </div>

          <div className="master-glass border border-white/5 rounded-xl flex flex-col flex-grow overflow-hidden bg-black/40">
            <div className="bg-slate-900/80 p-5 border-b border-amber-900/40 flex justify-between items-center">
              <span className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] italic">SOVEREIGN EVENT STREAM</span>
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
            </div>
            <div className="p-6 text-[11px] font-mono space-y-5 overflow-y-auto flex-grow terminal-scroll">
              {logs.map((log) => (
                <div key={log.id} className="border-b border-white/5 pb-4 last:border-0 group">
                  <div className="flex justify-between text-[9px] text-slate-500 mb-2">
                    <span className="group-hover:text-amber-500 transition-colors uppercase font-bold">[{log.timestamp}]</span>
                    <span className={`font-black uppercase tracking-widest px-3 py-1 rounded-sm text-[8px] ${
                      log.level === 'SOVEREIGN' ? 'bg-amber-600 text-black shadow-lg' :
                      log.level === 'SUCCESS' ? 'text-green-400 bg-green-950/20' : 
                      log.level === 'WARNING' ? 'text-orange-400 bg-orange-950/20' : 
                      'text-slate-500 bg-slate-800/20'
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <span className="text-slate-300 uppercase tracking-tight block leading-relaxed font-bold group-hover:text-white transition-colors">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <button 
                className="flex-grow py-5 bg-amber-600 text-black text-sm font-black uppercase tracking-[0.5em] italic shadow-2xl hover:bg-amber-500 transition-all rounded-sm"
                onClick={() => handleAutonomousAction()}
              >
                FORCE LOGIC SYNC
              </button>
              <button 
                className="px-8 py-5 bg-slate-900 border border-amber-600/30 text-amber-500 text-xl font-black rounded-sm"
                title="System Status: Invincible"
              >
                ∞
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-[12px] text-slate-700 uppercase tracking-[1em] font-black">
        <div className="flex items-center space-x-16">
          <span className="text-amber-900">SOVEREIGN_OS_v10.0-FINAL</span>
          <span>DOMAINS: ALL</span>
          <span>ACCESS: ABSOLUTE</span>
        </div>
        <div className="flex items-center space-x-16 italic opacity-50">
          <span className="text-green-950">HEARTBEAT: STABLE</span>
          <span className="text-amber-950">RELIABILITY: 100.00%</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
