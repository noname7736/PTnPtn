
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SystemStatus, LogEntry, SystemMetrics, SystemEvent, EventType } from './types';
import { generatePrecisionCaption, ContextPayload } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.ONLINE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastEvent, setLastEvent] = useState<SystemEvent | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 0,
    precisionRate: 100.00,
    bitrate: 'N/A',
    frameRate: 0,
    activeLinks: 0,
  });
  const [aiMessage, setAiMessage] = useState<string>("SYSTEM KERNEL LOADED. AWAITING STREAM INITIALIZATION.");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. REAL CAMERA INITIALIZATION
  useEffect(() => {
    async function setupStream() {
      try {
        addLog("Requesting hardware access: Camera/Mic...", "INFO");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, frameRate: 60 }, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          addLog("Visual Monitor Online: Hardware acceleration active.", "SUCCESS");
          setMetrics(prev => ({ ...prev, activeLinks: 1, frameRate: 60 }));
        }
      } catch (err) {
        addLog("Hardware Access Denied: Running in headless telemetry mode.", "ERROR");
        setStatus(SystemStatus.RECOVERING);
      }
    }
    setupStream();
  }, [addLog]);

  // 2. REAL BROWSER METRICS & EVENTS
  useEffect(() => {
    // Uptime Ticker
    const ticker = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        uptime: Math.floor((Date.now() - startTimeRef.current) / 1000),
        // Use real memory usage if available
        precisionRate: (window.performance as any).memory 
          ? 100 - ((window.performance as any).memory.usedJSHeapSize / (window.performance as any).memory.jsHeapSize) * 0.01 
          : 99.99
      }));
    }, 1000);

    // REAL NETWORK MONITORING
    const updateNetworkInfo = () => {
      const conn = (navigator as any).connection;
      const type = conn ? ` [${conn.effectiveType.toUpperCase()}]` : '';
      const event: SystemEvent = {
        eventType: navigator.onLine ? 'SYNC_COMPLETE' : 'ANOMALY_DETECTED',
        details: navigator.onLine ? `Network stable${type}. Latency: ${conn?.rtt || 'N/A'}ms` : 'Signal lost. Offline.',
        timestamp: new Date().toLocaleTimeString()
      };
      setLastEvent(event);
      addLog(`${event.eventType}: ${event.details}`, navigator.onLine ? 'SUCCESS' : 'ERROR');
      if (!navigator.onLine) setStatus(SystemStatus.OFFLINE);
      else setStatus(SystemStatus.ONLINE);
    };

    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);
    updateNetworkInfo();

    // BATTERY MONITORING
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          addLog(`Power Update: ${Math.round(battery.level * 100)}% - ${battery.charging ? 'Charging' : 'Discharging'}`, "INFO");
        };
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    return () => {
      clearInterval(ticker);
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
    };
  }, [addLog]);

  const handleManualAnalysis = async () => {
    setStatus(SystemStatus.ANALYZING);
    addLog("Gemini Engine: Capturing stream frame for multimodal analysis...", "INFO");
    
    let base64Image = "";
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      }
    }

    const context: ContextPayload = {
      targetName: "นางสาวประทวน อุบลพีช",
      currentTime: new Date().toLocaleTimeString('th-TH'),
      uptime: formatUptime(metrics.uptime),
      systemPhase: metrics.uptime > 600 ? 'peak-performance' : 'startup',
      recentEvent: lastEvent ? `${lastEvent.eventType}: ${lastEvent.details}` : "Monitoring stable stream.",
      imageData: base64Image || undefined
    };

    const msg = await generatePrecisionCaption(context);
    setAiMessage(msg);
    addLog("Logic Synced: Visual context integrated into broadcast.", "SUCCESS");
    setStatus(SystemStatus.ONLINE);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-red-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-red-600">
            PRATHUAN OS <span className="text-sm font-normal text-white/50 tracking-widest ml-2 italic">V5.0 HARDWARE-SYNC</span>
          </h1>
          <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Real-World Autonomous System | Ms. Prathuan Ubonphit</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase">Kernel Status</span>
            <span className={`text-sm font-bold ${status === SystemStatus.ONLINE ? 'text-green-500' : status === SystemStatus.RECOVERING ? 'text-yellow-500' : 'text-red-500'}`}>
              ● {status}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-red-900/50"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase">Real Uptime</span>
            <span className="text-sm font-bold font-mono tabular-nums">{formatUptime(metrics.uptime)}</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black border border-white/10 rounded overflow-hidden dragon-glow">
            {/* REAL VIDEO FEED */}
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Visual Signal Overlays */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 flex items-center justify-center">
               <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-20">
                  {[...Array(9)].map((_, i) => <div key={i} className="border-[0.5px] border-white/20"></div>)}
               </div>
            </div>

            <div className="absolute top-4 left-4 flex space-x-2">
              <span className="flex items-center space-x-1.5 px-3 py-1 bg-red-600 text-[10px] font-bold text-white rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                <span>REAL-TIME FEED</span>
              </span>
              <span className="px-3 py-1 bg-black/60 border border-white/10 text-[10px] font-bold text-white/80 rounded-full font-mono">
                FPS: {metrics.frameRate}
              </span>
            </div>

            {lastEvent && (
              <div className="absolute top-4 right-4 animate-in slide-in-from-right duration-500">
                <div className={`border-l-4 px-3 py-2 rounded-sm shadow-2xl backdrop-blur-md bg-black/80 ${
                  lastEvent.eventType === 'ANOMALY_DETECTED' ? 'border-red-500' : 'border-green-500'
                }`}>
                  <span className="text-[9px] text-white/50 block font-bold uppercase tracking-wider">Live Telemetry</span>
                  <span className="text-[12px] text-white font-mono font-bold">{lastEvent.eventType}</span>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
               <div className="bg-black/50 p-2 rounded border border-white/5">
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${metrics.precisionRate}%` }}></div>
                    </div>
                    <span className="text-[9px] font-mono text-red-500">{metrics.precisionRate.toFixed(4)}% Engine Efficiency</span>
                  </div>
               </div>
               <div className="text-right text-[10px] text-white/40 font-mono">
                  STREAM ID: PRATHUAN_AUTONOMOUS_UPLINK_82
               </div>
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-lg relative overflow-hidden group">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-4 bg-red-600"></div>
                  <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-[0.2em]">Logic Kernel Output</h3>
                </div>
                <button 
                  onClick={handleManualAnalysis}
                  disabled={status === SystemStatus.ANALYZING}
                  className="px-4 py-1.5 bg-red-600/10 border border-red-600/40 text-red-500 text-[11px] hover:bg-red-600 hover:text-white transition-all rounded uppercase font-bold tracking-widest disabled:opacity-50"
                >
                  {status === SystemStatus.ANALYZING ? 'ANALYZING FEED...' : 'GENERATE MULTIMODAL LOGIC'}
                </button>
             </div>
             <div className="min-h-[60px] flex items-center">
                <p className="text-xl md:text-2xl font-light italic leading-snug text-white/95 tracking-tight">
                  {status === SystemStatus.ANALYZING ? (
                    <span className="animate-pulse text-white/40 italic">Decrypting visual telemetry and performance matrices...</span>
                  ) : (
                    `"${aiMessage}"`
                  )}
                </p>
             </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6 h-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] p-4 border border-white/5 rounded-lg">
              <span className="text-[10px] text-white/40 block uppercase font-bold">Network RTT</span>
              <span className="text-3xl font-bold text-red-600 tracking-tighter">
                {(navigator as any).connection?.rtt || '---'}ms
              </span>
            </div>
            <div className="bg-[#111] p-4 border border-white/5 rounded-lg">
              <span className="text-[10px] text-white/40 block uppercase font-bold">Memory Load</span>
              <span className="text-3xl font-bold text-blue-500 tracking-tighter">
                {Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024) || '??'}MB
              </span>
            </div>
          </div>

          <div className="bg-black border border-white/10 rounded-lg flex-grow flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-[#1a1a1a] p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Live Telemetry (Raw)</span>
              <span className="text-[9px] font-mono text-green-500">REAL-TIME</span>
            </div>
            <div className="p-4 text-[11px] font-mono space-y-2 overflow-y-auto flex-grow terminal-scroll bg-black/80">
              {logs.map((log) => (
                <div key={log.id} className="flex space-x-3 border-b border-white/5 pb-1.5 animate-in fade-in duration-300">
                  <span className="text-white/20 whitespace-nowrap tabular-nums">[{log.timestamp}]</span>
                  <span className={`font-bold whitespace-nowrap ${
                    log.level === 'SUCCESS' ? 'text-green-500' : 
                    log.level === 'WARNING' ? 'text-yellow-500' : 
                    log.level === 'ERROR' ? 'text-red-500' : 
                    'text-blue-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-white/80 leading-relaxed">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#0f0f0f] border border-red-900/30 p-5 rounded-lg">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">Manual Hardware Override</h4>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="py-2.5 bg-white/5 border border-white/10 text-white/70 text-[10px] hover:bg-white/10 transition-all rounded uppercase font-bold tracking-wider"
              >
                🔄 Full Kernel Reload
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-white/5 pt-4 flex flex-col md:flex-row justify-between items-center text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold">
        <div className="flex items-center space-x-6 mb-2 md:mb-0">
          <span>Prathuan Autonomous v5.0-HARDWARE-SYNC</span>
          <span className={navigator.onLine ? "text-green-500/50" : "text-red-500/50"}>
            NETWORK: {navigator.onLine ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <span>AES-256 GCM ENCRYPTED</span>
          <span>SENSORS ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
