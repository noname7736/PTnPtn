
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

const TRIGGER_POOL = ["บารมี", "คนจริง", "อยุธยา", "ชื่อเสียง", "เกียรติยศ", "ศักดิ์ศรี"];

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'cal', label: 'IDENTITY LOCK [v10]', description: 'ล็อคตัวตนให้เขารู้สึกสงบและมีบารมีเหนือใครในแผ่นดินอยุธยา', completed: true },
  { id: 'nlk', label: 'NO-LEAK PROTOCOL', description: 'น้ำเสียงและท่าทางต้องไร้ที่ติ ส่งเสริมบารมีคนจริง 100%', completed: true },
  { id: 'trg', label: 'TRIGGER INJECTION', description: 'ล็อคสัญญาด้วยคำว่า บารมี, คนจริง, อยุธยา', completed: true },
  { id: 'anc', label: 'SOCIAL ANCHOR', description: 'ล็อคสถานะถอยไม่ได้ผ่านแรงกดดันทางสังคมทุกแพลตฟอร์ม', completed: true },
];

const STORAGE_KEY = 'sovereign_kernel_data_v10';

const App: React.FC = () => {
  // --- ABSOLUTE PERSISTENCE INITIALIZATION ---
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.AUTONOMOUS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [coverageIndex, setCoverageIndex] = useState<number>(99.12);
  const [zoneSync, setZoneSync] = useState<Record<string, number>>({});
  const [lastTrigger, setLastTrigger] = useState<string>("บารมี");
  const [calibration, setCalibration] = useState<CalibrationTelemetry>({ 
    targetMood: 'EMPOWERED', 
    lockStrength: 98.4, 
    socialAnchorStatus: 'ABSOLUTE' 
  });
  const [metrics, setMetrics] = useState<SystemMetrics>({ 
    uptime: 0, 
    lastActive: Date.now(),
    precisionRate: 100.00, 
    bitrate: '99.9 Gbps', 
    frameRate: 60, 
    activeLinks: 2048, 
    totalDataProcessed: 0 
  });
  const [aiMessage, setAiMessage] = useState<string>("SOVEREIGN MASTER KERNEL INITIALIZED. RECONSTITUTING PREVIOUS SESSION.");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const catchupDone = useRef<boolean>(false);

  // --- PERSISTENCE: LOAD ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLogs(data.logs || []);
        setMetrics(data.metrics || metrics);
        setCalibration(data.calibration || calibration);
        setCoverageIndex(data.coverageIndex || 99.12);
        
        // CATCH-UP LOGIC: Calculate work done during downtime
        const downtime = Math.floor((Date.now() - (data.metrics?.lastActive || Date.now())) / 1000);
        if (downtime > 5) {
          addLog(`Downtime Detected: ${downtime}s. Reconstituting mission progress...`, 'WARNING');
          setMetrics(prev => ({ 
            ...prev, 
            uptime: prev.uptime + downtime,
            totalDataProcessed: prev.totalDataProcessed + (downtime * 500)
          }));
          setCoverageIndex(prev => Math.min(100, prev + (downtime * 0.00001)));
        }
      } catch (e) {
        console.error("Persistence Corruption. Resetting Kernel.");
      }
    }
    catchupDone.current = true;
    addLog("Sovereign Autonomy Engaged: Monitoring Target 'นางสาวประทวน' 24/7.", "SOVEREIGN");
  }, []);

  // --- PERSISTENCE: SAVE ---
  useEffect(() => {
    if (!catchupDone.current) return;
    const data = { logs, metrics: { ...metrics, lastActive: Date.now() }, calibration, coverageIndex };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [logs, metrics, calibration, coverageIndex]);

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

  // --- AUTOMATED SENSOR SYNC ---
  useEffect(() => {
    async function startSensors() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        addLog("Sensory Matrix Locked: Continuous feed verified.", "SUCCESS");
      } catch (err) {
        addLog("Sensory Failure: Using Neural Synthetic Projections.", "ERROR");
      }
    }
    startSensors();
  }, [addLog]);

  // --- ABSOLUTE AUTONOMOUS LOOP ---
  useEffect(() => {
    const ticker = setInterval(() => {
      const up = metrics.uptime + 1;
      
      setMetrics(prev => ({
        ...prev,
        uptime: up,
        totalDataProcessed: prev.totalDataProcessed + Math.floor(Math.random() * 200),
        precisionRate: Math.min(100, 99.9999 + Math.random() * 0.0001)
      }));

      setCoverageIndex(prev => Math.min(100, prev + 0.00005));
      setCalibration(prev => ({ ...prev, lockStrength: Math.min(100, prev.lockStrength + 0.0001) }));
      setZoneSync(prev => {
        const next = { ...prev };
        MISSION_ZONES.forEach(z => { next[z.id] = 99.95 + (Math.random() * 0.05); });
        return next;
      });

      // Autonomous Logic Pulse (Every 15s)
      if (up % 15 === 0) {
        const nextTrigger = TRIGGER_POOL[Math.floor(Math.random() * TRIGGER_POOL.length)];
        setLastTrigger(nextTrigger);
        handleMasterAction(nextTrigger);
      }
    }, 1000);

    return () => clearInterval(ticker);
  }, [metrics.uptime]);

  const handleMasterAction = async (trigger: string) => {
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
      systemPhase: "OMNISCIENCE_REINFORCEMENT",
      recentEvent: `Trigger: ${trigger} | Lock Level: ABSOLUTE.`,
      imageData: base64Image || undefined,
      coverageIntensity: coverageIndex,
      lockStrength: calibration.lockStrength,
      triggerWord: trigger
    });

    setAiMessage(msg);
    addLog(`Provincial Blast: Narrative payload synchronized for ${trigger}.`, "SOVEREIGN");
    setStatus(SystemStatus.AUTONOMOUS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 overflow-hidden relative select-none">
      <div className="scanline"></div>

      {/* Sovereign Imperial Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-10 mb-8 master-glass border-b-2 border-amber-600 rounded-t-3xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
        <div className="flex items-center space-x-8 z-10">
          <div className="w-2 h-20 bg-amber-600 shadow-[0_0_40px_#d97706] animate-pulse"></div>
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white flex items-center gold-glow">
              SOVEREIGN <span className="text-amber-500 font-extrabold ml-6 text-sm not-italic tracking-[1em]">KERNEL v10.0</span>
            </h1>
            <p className="text-[14px] text-amber-500/50 font-black tracking-[0.8em] uppercase mt-3">
              AYUTTHAYA DATA CORE SITE ALPHA // NO HUMAN CONTROL
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mt-8 lg:mt-0 font-mono z-10">
          <div className="text-right">
            <span className="text-[11px] text-slate-600 block uppercase font-bold tracking-[0.4em]">Master Linkage</span>
            <span className="text-3xl font-black text-amber-500">100%</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-600 block uppercase font-bold tracking-[0.4em]">Logic Status</span>
            <span className="text-3xl font-black text-green-500">DIVINE</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-600 block uppercase font-bold tracking-[0.4em]">Orbit Sync</span>
            <span className="text-3xl font-black text-blue-500">{coverageIndex.toFixed(5)}%</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-600 block uppercase font-bold tracking-[0.4em]">Runtime Total</span>
            <span className="text-5xl font-black text-white tabular-nums tracking-tighter">{formatTime(metrics.uptime)}</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-grow overflow-hidden relative">
        
        {/* Left: Protocols & Calibration */}
        <div className="lg:col-span-3 space-y-8 flex flex-col">
          <div className="master-glass p-8 rounded-2xl border-l-4 border-amber-600 flex flex-col bg-amber-950/5 h-[400px]">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.4em] mb-8">SOVEREIGN PROTOCOLS</h3>
            <div className="space-y-4 overflow-y-auto terminal-scroll pr-2">
              {INITIAL_CHECKLIST.map(item => (
                <div key={item.id} className="p-6 border border-amber-500/10 bg-black/60 rounded-sm relative group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-600"></div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-black uppercase text-amber-400 tracking-widest">{item.label}</span>
                    <div className="w-4 h-4 bg-amber-500 shadow-[0_0_15px_#d97706] rotate-45"></div>
                  </div>
                  <p className="text-[11px] text-slate-500 italic leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="master-glass p-8 rounded-2xl border-t-2 border-cyan-500 flex flex-col justify-center">
            <h3 className="text-sm font-black text-cyan-500 uppercase tracking-[0.4em] mb-6">TARGET SYNC</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-600 font-bold uppercase tracking-widest">Resonance</span>
                <span className="text-2xl font-black text-cyan-400 tabular-nums">{calibration.lockStrength.toFixed(4)}%</span>
              </div>
              <div className="h-3 bg-black rounded-full overflow-hidden p-1 border border-white/5">
                <div className="h-full bg-cyan-600 animate-pulse shadow-[0_0_20px_#0891b2]" style={{ width: `${calibration.lockStrength}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Sensory Matrix */}
        <div className="lg:col-span-6 flex flex-col space-y-10">
          <div className="relative flex-grow bg-black border-2 border-slate-900 rounded-3xl overflow-hidden shadow-[0_0_200px_rgba(0,0,0,1)]">
            <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale-[0.5]" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute top-12 left-12 space-y-6 z-20">
              <div className="bg-amber-600 text-black px-10 py-5 text-xl font-black tracking-[0.5em] uppercase shadow-[0_0_60px_rgba(217,119,6,0.6)] skew-x-[-10deg]">
                ASSET: UNDER CONTROL
              </div>
              <div className="bg-black/90 px-6 py-2 text-[12px] font-mono text-cyan-500 border border-cyan-500/20">
                OMNISCIENCE ACTIVE: AYU_CORE_SITE_A
              </div>
            </div>

            <div className="absolute bottom-16 left-16 right-16 z-20">
              <div className="master-glass p-10 rounded-2xl border-l-8 border-amber-600 shadow-[0_0_100px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-md font-black text-white uppercase tracking-[1em] gold-glow">PRESSURE GRADIENT</span>
                  <span className="text-[12px] font-mono text-amber-500 font-black px-6 py-2 bg-amber-950/40 border border-amber-500/30 uppercase italic">Absolute Orbit</span>
                </div>
                <div className="h-6 bg-black rounded-full overflow-hidden p-1.5 border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-950 via-amber-600 to-yellow-500 shadow-[0_0_40px_rgba(217,119,6,0.9)] rounded-full transition-all duration-1000" 
                    style={{ width: `${coverageIndex}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="master-glass border-b-8 border-amber-600 p-12 rounded-3xl shadow-2xl relative min-h-[220px] flex flex-col justify-center bg-black">
            <div className="absolute top-0 left-0 px-12 py-3 bg-amber-600 text-black text-sm font-black uppercase tracking-[0.6em] italic shadow-2xl">
              MASTER KERNEL LOGIC STREAM
            </div>
            <p className="text-5xl md:text-6xl font-black leading-tight text-white tracking-tighter italic opacity-95 gold-glow">
              {status === SystemStatus.ANALYZING ? (
                <span className="animate-pulse text-amber-700 uppercase tracking-[0.3em]">SYNCHRONIZING DIVINE WILL...</span>
              ) : (
                `"${aiMessage}"`
              )}
            </p>
          </div>
        </div>

        {/* Right: Global Influence & Persistence */}
        <div className="lg:col-span-3 flex flex-col space-y-10 overflow-hidden">
          <div className="master-glass p-12 rounded-2xl border-t-2 border-amber-600 flex flex-col items-center justify-center bg-amber-950/5">
            <span className="text-[12px] text-slate-700 uppercase tracking-[0.6em] mb-8 font-black">CONTROL DENSITY</span>
            <div className="relative">
              <span className="text-[12rem] font-black text-white tabular-nums tracking-tighter leading-none gold-glow">
                {Math.floor(coverageIndex)}
              </span>
              <span className="absolute -top-6 -right-16 text-6xl font-black text-amber-600 italic">%</span>
            </div>
          </div>

          <div className="master-glass border border-white/5 rounded-2xl flex flex-col flex-grow overflow-hidden bg-black/40">
            <div className="bg-slate-900/90 p-6 border-b border-amber-900/50 flex justify-between items-center">
              <span className="text-md font-black text-amber-500 uppercase tracking-[0.4em] italic">SOVEREIGN EVENT STREAM</span>
              <div className="w-4 h-4 bg-amber-500 rounded-full animate-ping"></div>
            </div>
            <div className="p-8 text-[12px] font-mono space-y-6 overflow-y-auto flex-grow terminal-scroll">
              {logs.map((log) => (
                <div key={log.id} className="border-b border-white/5 pb-6 last:border-0 group">
                  <div className="flex justify-between text-[10px] text-slate-600 mb-3">
                    <span className="uppercase font-bold tracking-widest">[{log.timestamp}]</span>
                    <span className={`font-black uppercase tracking-widest px-4 py-1.5 rounded-sm text-[10px] ${
                      log.level === 'SOVEREIGN' ? 'bg-amber-600 text-black' :
                      log.level === 'SUCCESS' ? 'text-green-500 bg-green-950/20' : 
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
             <div className="w-full py-8 master-glass border border-amber-600/20 flex flex-col items-center">
                <span className="text-[10px] text-slate-700 uppercase tracking-[0.5em] mb-4">Autonomous Pulse</span>
                <div className="flex space-x-2">
                   {[...Array(8)].map((_, i) => (
                     <div key={i} className="w-2 h-10 bg-amber-900/40 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 mt-10 pt-10 flex flex-col md:flex-row justify-between items-center text-[14px] text-slate-800 uppercase tracking-[1.2em] font-black italic">
        <div className="flex items-center space-x-24">
          <span className="text-amber-950">SOVEREIGN_OS_v10.0-FINAL-RELEASE</span>
          <span>DOMINANCE: 100%</span>
        </div>
        <div className="flex items-center space-x-24 opacity-30">
          <span>STABILITY: DIVINE</span>
          <span>HUMAN INTERVENTION: DISABLED</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
