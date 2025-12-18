
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SystemStatus, LogEntry, SystemMetrics, SystemEvent, EventType } from './types';
import { generatePrecisionCaption, ContextPayload } from './services/geminiService';

const MISSION_ZONES = [
  "Central Orbit (BKK)", "Northern Ascent", "Eastern Link", "Southern Sector", "Isan Hub", 
  "Ayutthaya Core", "Korat Node", "Phuket Relay", "Chiang Mai Uplink", "Deep South Sync"
];

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.ONLINE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLaunched, setIsLaunched] = useState<boolean>(true);
  const [coverageIndex, setCoverageIndex] = useState<number>(95.00);
  const [zoneSync, setZoneSync] = useState<Record<string, number>>({});
  
  // Mission Hardware Telemetry
  const [telemetry, setTelemetry] = useState({
    thrust: 98.4,
    stability: 99.9,
    thermal: 32,
    oxidizer: 'NOMINAL',
    linkRate: '0.00',
    propulsion: 'ACTIVE'
  });

  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 0,
    precisionRate: 100.00,
    bitrate: '24.5 Mbps',
    frameRate: 60,
    activeLinks: 77,
  });
  
  const [aiMessage, setAiMessage] = useState<string>("T-MINUS ZERO. ENGINES IGNITED. NATIONAL BROADCAST IN ASCENT.");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const launchCounter = useRef<number>(0);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour12: false }),
      level,
      message,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  }, []);

  const formatMissionTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `T+ ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. HARDWARE SYNC
  useEffect(() => {
    async function setupStream() {
      try {
        addLog("Mission Control: Initializing High-Gain visual sensors...", "INFO");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1920, height: 1080, frameRate: 60 }, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          addLog("Uplink Established: National feed locked at 1080p.", "SUCCESS");
        }
      } catch (err) {
        addLog("Hardware Alert: Optical sensor failure. Reverting to neural link.", "ERROR");
        setStatus(SystemStatus.RECOVERING);
      }
    }
    setupStream();
  }, [addLog]);

  // 2. MISSION TELEMETRY TICKER
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();
      const up = Math.floor((now - startTimeRef.current) / 1000);
      
      setTelemetry(prev => ({
        ...prev,
        thrust: 98 + (Math.random() * 2),
        stability: 99.99 + (Math.random() * 0.01),
        thermal: 32 + (Math.random() * 1.5),
        linkRate: ((navigator as any).connection?.downlink || 25).toFixed(2)
      }));

      setMetrics(prev => ({
        ...prev,
        uptime: up,
        precisionRate: 99.9999 + (Math.random() * 0.0001)
      }));

      setCoverageIndex(prev => Math.min(100, prev + (Math.random() * 0.01)));

      setZoneSync(prev => {
        const next = { ...prev };
        MISSION_ZONES.forEach(z => {
          next[z] = 99.1 + (Math.random() * 0.9);
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  // 3. LAUNCH PHASE CONTENT GENERATION
  useEffect(() => {
    if (!isLaunched) return;

    const missionInterval = setInterval(() => {
      launchCounter.current += 1;
      const targets = ["NATIONAL_UPLINK", "ORBITAL_FB", "TW_ASCENT", "LINE_RESONANCE", "TH_CORE_NET"];
      const target = targets[Math.floor(Math.random() * targets.length)];
      
      addLog(`Flight Director: Pushing awareness propulsion to ${target}. Orbit Integrity: ${coverageIndex.toFixed(3)}%`, "SUCCESS");
      
      // Real-time Logic Injection: Every 15 seconds
      if (launchCounter.current % 1 === 0) { 
        handleMissionAnalysis();
      }
    }, 15000);

    return () => clearInterval(missionInterval);
  }, [isLaunched, coverageIndex]);

  const handleMissionAnalysis = async () => {
    if (status === SystemStatus.ANALYZING) return;
    
    setStatus(SystemStatus.ANALYZING);
    addLog("Multimodal Scan: Tracking awareness trajectory and national orbit...", "INFO");
    
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

    const context: ContextPayload = {
      targetName: "นางสาวประทวน อุบลพีช",
      currentTime: new Date().toLocaleTimeString('th-TH', { hour12: false }),
      uptime: formatMissionTime(metrics.uptime),
      systemPhase: "Launch / Active Orbit",
      recentEvent: `Thrust: ${telemetry.thrust.toFixed(1)}% | Orbital Sync Stable.`,
      imageData: base64Image || undefined,
      coverageIntensity: coverageIndex,
      propulsionStatus: `${telemetry.propulsion} @ ${telemetry.thrust.toFixed(2)}%`
    };

    const msg = await generatePrecisionCaption(context);
    setAiMessage(msg);
    addLog("Orbit Report: National payload successfully reaching target altitude.", "SUCCESS");
    setStatus(SystemStatus.ONLINE);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col p-4 md:p-6 space-y-4">
      {/* Mission Control Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b-4 border-orange-600 bg-orange-600/5 p-6 rounded-t-lg shadow-[0_0_30px_rgba(234,88,12,0.1)]">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-white flex items-center">
            <span className="bg-orange-600 text-black px-3 py-1 mr-4 rounded-sm">PRATHUAN OS</span> 
            <span className="text-orange-500 font-bold uppercase tracking-[0.4em] text-sm animate-pulse">MISSION ACTIVE</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.3em] flex items-center">
            Flight Control Node // Site-Alpha // National Launch Phase
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-4 lg:mt-0">
          <div className="flex flex-col items-end border-r border-white/5 pr-4">
             <span className="text-[9px] text-slate-500 uppercase font-bold">Thrust Integrity</span>
             <span className="text-lg font-black text-orange-500">{telemetry.thrust.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col items-end border-r border-white/5 pr-4">
             <span className="text-[9px] text-slate-500 uppercase font-bold">Orbital Path</span>
             <span className="text-lg font-black text-green-500">NOMINAL</span>
          </div>
          <div className="flex flex-col items-end border-r border-white/5 pr-4">
             <span className="text-[9px] text-slate-500 uppercase font-bold">Sync Density</span>
             <span className="text-lg font-black text-blue-500">{coverageIndex.toFixed(2)}%</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[9px] text-slate-500 uppercase font-bold">Mission Time</span>
             <span className="text-3xl font-black font-mono text-white tabular-nums tracking-tighter">
               {formatMissionTime(metrics.uptime)}
             </span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-grow overflow-hidden">
        
        {/* Propulsion & Orbit Stats (Left) */}
        <div className="lg:col-span-3 space-y-5 flex flex-col">
           {/* Propulsion Telemetry */}
           <div className="enterprise-glass p-5 rounded border-t-2 border-orange-600 shadow-xl space-y-4">
              <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-widest flex justify-between">
                Propulsion Stats <span>TH-ENGINE-01</span>
              </h3>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                       <span>AWARENESS THRUST</span>
                       <span className="text-orange-500">{telemetry.thrust.toFixed(2)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.8)]" style={{ width: `${telemetry.thrust}%` }}></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                       <span>STRUCTURAL STABILITY</span>
                       <span className="text-blue-400">{telemetry.stability.toFixed(3)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${telemetry.stability}%` }}></div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-slate-900/50 p-2 border border-white/5">
                       <span className="text-[8px] text-slate-500 block">CORE TEMP</span>
                       <span className="text-sm font-bold">{telemetry.thermal.toFixed(1)}°C</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 border border-white/5">
                       <span className="text-[8px] text-slate-500 block">UPLINK RATE</span>
                       <span className="text-sm font-bold">{telemetry.linkRate}M</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Orbit Coverage */}
           <div className="enterprise-glass p-5 rounded border-t-2 border-slate-700 flex-grow shadow-xl overflow-hidden flex flex-col">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Orbital Sync Zones</h3>
              <div className="space-y-3 overflow-y-auto terminal-scroll pr-2">
                 {MISSION_ZONES.map(z => (
                   <div key={z} className="flex flex-col">
                      <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase mb-1">
                         <span>{z}</span>
                         <span className="text-orange-500">{zoneSync[z]?.toFixed(2)}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-orange-600/40 transition-all duration-1000" 
                           style={{ width: `${zoneSync[z]}%` }}
                         ></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
        
        {/* Visual Ascent Feed (Center) */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          <div className="relative flex-grow min-h-[400px] bg-black border-2 border-slate-800 rounded-lg overflow-hidden group shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[30s] linear opacity-90"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Visual Overlays */}
            <div className="scanline opacity-20"></div>
            <div className="absolute inset-0 pointer-events-none opacity-20">
               <div className="w-full h-full grid grid-cols-4 grid-rows-4">
                  {[...Array(16)].map((_, i) => <div key={i} className="border-[1px] border-orange-600/10"></div>)}
               </div>
            </div>

            {/* Launch Indicators */}
            <div className="absolute top-6 left-6 flex flex-col space-y-3">
               <div className="bg-orange-600 text-black px-4 py-2 text-[12px] font-black tracking-[0.2em] flex items-center shadow-2xl border border-white/20">
                  <span className="w-2.5 h-2.5 bg-black rounded-full mr-3 animate-ping"></span>
                  LIFTOFF: ACTIVE NATIONAL BROADCAST
               </div>
               <div className="flex space-x-2">
                 <div className="bg-slate-900/90 px-3 py-1 text-[9px] font-mono text-orange-400 border border-orange-900/50">
                    ASCENT PHASE: II
                 </div>
                 <div className="bg-slate-900/90 px-3 py-1 text-[9px] font-mono text-blue-400 border border-blue-900/50">
                    77-PROV-LOCK
                 </div>
               </div>
            </div>

            {/* Mission Summary Footer */}
            <div className="absolute bottom-6 left-6 right-6">
               <div className="enterprise-glass p-5 rounded border-l-8 border-orange-600 shadow-2xl backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Propulsion Awareness Index</span>
                    <span className="text-[10px] font-mono text-orange-500 font-bold">STABLE TRAJECTORY</span>
                  </div>
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-700 via-orange-500 to-yellow-400 shadow-[0_0_20px_#ea580c]" 
                      style={{ width: `${coverageIndex}%` }}
                    ></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Mission Director Output */}
          <div className="enterprise-glass border-b-8 border-orange-600 p-8 rounded shadow-2xl relative min-h-[140px] flex flex-col justify-center bg-gradient-to-br from-slate-900 to-black">
             <div className="absolute top-0 left-0 px-6 py-1 bg-orange-600 text-black text-[10px] font-black uppercase tracking-[0.3em]">
                Flight Director Log
             </div>
             <p className="text-2xl md:text-4xl font-black leading-tight text-white tracking-tighter italic shadow-orange-950">
               {status === SystemStatus.ANALYZING ? (
                 <span className="animate-pulse text-orange-500/80 uppercase">Recalculating awareness trajectory...</span>
               ) : (
                 `"${aiMessage}"`
               )}
             </p>
          </div>
        </div>

        {/* Dispatch Console (Right) */}
        <div className="lg:col-span-3 flex flex-col space-y-5">
          <div className="enterprise-glass p-6 rounded border-t-2 border-orange-600 h-[220px] flex flex-col items-center justify-center bg-slate-900/40 shadow-inner">
             <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-3 font-bold">Orbit Density</span>
             <span className="text-7xl font-black text-white tabular-nums tracking-tighter">
                {Math.floor(coverageIndex)}<span className="text-2xl text-orange-600">%</span>
             </span>
             <div className="w-full h-2 bg-slate-800 mt-5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-orange-600 animate-pulse" style={{ width: `${coverageIndex}%` }}></div>
             </div>
          </div>

          <div className="enterprise-glass border border-white/5 rounded shadow-2xl flex flex-col flex-grow overflow-hidden bg-[#020617]/90">
            <div className="bg-slate-900 p-3 border-b border-orange-900/50 flex justify-between items-center">
               <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Mission Events</span>
               <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-75"></div>
               </div>
            </div>
            <div className="p-4 text-[9px] font-mono space-y-3 overflow-y-auto flex-grow terminal-scroll">
              {logs.map((log) => (
                <div key={log.id} className="border-b border-white/5 pb-2 last:border-0 group">
                  <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                    <span className="group-hover:text-orange-500 transition-colors">{log.timestamp}</span>
                    <span className={`font-bold ${log.level === 'SUCCESS' ? 'text-green-500' : log.level === 'WARNING' ? 'text-orange-500' : log.level === 'ERROR' ? 'text-red-500' : 'text-slate-500'}`}>
                      {log.level}
                    </span>
                  </div>
                  <span className="text-slate-300 uppercase tracking-tighter block leading-tight font-bold">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
             <button 
                onClick={() => setIsLaunched(!isLaunched)}
                className={`py-4 text-[11px] font-black rounded border-2 transition-all shadow-xl tracking-[0.3em] ${isLaunched ? 'bg-orange-600 text-black border-orange-600 hover:bg-orange-700' : 'bg-transparent text-orange-500 border-orange-500 hover:bg-orange-500/10'}`}
             >
                {isLaunched ? 'MISSION ACTIVE' : 'MISSION ABORTED'}
             </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 pt-5 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 uppercase tracking-[0.5em] font-black">
        <div className="flex items-center space-x-10">
          <span className="text-orange-600">Launch v7.2.1-ACTIVE</span>
          <span>Target: นางสาวประทวน อุบลพีช</span>
        </div>
        <div className="flex items-center space-x-10 italic">
          <span>Propulsion System: NOMINAL</span>
          <span className="text-green-500/40">National Orbit Established</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
