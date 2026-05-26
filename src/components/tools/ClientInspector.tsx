import React, { useState, useEffect } from 'react';
import { Eye, Monitor, Globe, Cpu, Copy } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const ClientInspector: React.FC = () => {
  const [userAgent, setUserAgent] = useState('');
  const [parsedUa, setParsedUa] = useState<any>({});
  const [screenInfo, setScreenInfo] = useState<any>({});
  const [browserCapabilities, setBrowserCapabilities] = useState<any>({});
  const [copySuccess, setCopySuccess] = useState(false);

  const { recordAction } = useToolState(
    'client-inspector',
    (values: any) => {
      if (values.userAgent !== undefined) setUserAgent(values.userAgent);
    },
    () => ({ userAgent })
  );

  const parseUA = (uaString: string) => {
    let browserName = 'Unknown Browser';
    let osName = 'Unknown OS';
    let engine = 'Unknown Engine';

    // Simple robust local regex parser for user agents
    if (uaString.indexOf('Firefox') > -1) {
      browserName = 'Mozilla Firefox';
    } else if (uaString.indexOf('SamsungBrowser') > -1) {
      browserName = 'Samsung Internet';
    } else if (uaString.indexOf('Opera') > -1 || uaString.indexOf('OPR') > -1) {
      browserName = 'Opera';
    } else if (uaString.indexOf('Trident') > -1) {
      browserName = 'Internet Explorer';
    } else if (uaString.indexOf('Edge') > -1 || uaString.indexOf('Edg') > -1) {
      browserName = 'Microsoft Edge';
    } else if (uaString.indexOf('Chrome') > -1) {
      browserName = 'Google Chrome';
    } else if (uaString.indexOf('Safari') > -1) {
      browserName = 'Apple Safari';
    }

    if (uaString.indexOf('Windows') > -1) {
      osName = 'Windows';
    } else if (uaString.indexOf('Macintosh') > -1 || uaString.indexOf('Mac OS X') > -1) {
      osName = 'macOS';
    } else if (uaString.indexOf('Android') > -1) {
      osName = 'Android';
    } else if (uaString.indexOf('iPhone') > -1 || uaString.indexOf('iPad') > -1) {
      osName = 'iOS';
    } else if (uaString.indexOf('Linux') > -1) {
      osName = 'Linux';
    }

    if (uaString.indexOf('AppleWebKit') > -1) {
      engine = 'WebKit (Blink/Safari)';
    } else if (uaString.indexOf('Gecko') > -1 && uaString.indexOf('KHTML') === -1) {
      engine = 'Gecko (Firefox)';
    } else if (uaString.indexOf('Presto') > -1) {
      engine = 'Presto';
    }

    setParsedUa({ browserName, osName, engine });
  };

  useEffect(() => {
    const ua = navigator.userAgent;
    setUserAgent(ua);
    parseUA(ua);

    // Populate screen specs
    setScreenInfo({
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation ? window.screen.orientation.type : 'N/A',
    });

    // Populate advanced client features
    let webgl = false;
    try {
      const canvas = document.createElement('canvas');
      webgl = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      // ignore
    }

    setBrowserCapabilities({
      cookiesEnabled: navigator.cookieEnabled,
      language: navigator.language,
      languages: navigator.languages.join(', '),
      online: navigator.onLine,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      webglSupported: webgl,
      hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
    });

    recordAction({ userAgent: ua });
  }, []);

  const handleCopyDiagnostics = async () => {
    const payload = {
      userAgent,
      parsedUa,
      screenInfo,
      browserCapabilities,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Eye className="w-8 h-8 text-nexus-accent animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold glow-text">Client Inspector & diagnostics</h2>
            <p className="text-xs text-slate-400">Review browser information, canvas hardware and display dimensions.</p>
          </div>
        </div>

        <button
          onClick={handleCopyDiagnostics}
          className="px-4 py-2 bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-center"
        >
          <Copy className="w-3.5 h-3.5" /> {copySuccess ? 'Copied Data!' : 'Copy Diagnostics'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User agent section */}
        <div className="space-y-4 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">User Agent String</label>
          <textarea
            className="w-full h-20 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-xs focus:outline-none focus:border-nexus-accent/50 transition-colors custom-scrollbar resize-none"
            value={userAgent}
            onChange={(e) => {
              setUserAgent(e.target.value);
              parseUA(e.target.value);
            }}
          />
        </div>

        {/* Operating system details */}
        <div className="glass p-5 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-nexus-accent flex items-center gap-2">
            <Cpu className="w-4 h-4" /> System & Engine
          </h3>
          <div className="divide-y divide-white/5 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Identified Browser</span>
              <span className="font-semibold text-white">{parsedUa.browserName}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Operating System</span>
              <span className="font-semibold text-white">{parsedUa.osName}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Rendering Engine</span>
              <span className="font-semibold text-white">{parsedUa.engine}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">CPU Core Concurrency</span>
              <span className="font-semibold text-white">{browserCapabilities.hardwareConcurrency}</span>
            </div>
          </div>
        </div>

        {/* Screen layout specifications */}
        <div className="glass p-5 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-nexus-accent flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Screen & Viewport
          </h3>
          <div className="divide-y divide-white/5 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Screen Resolution</span>
              <span className="font-semibold text-white">
                {screenInfo.screenWidth} x {screenInfo.screenHeight}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Viewport Dimensions</span>
              <span className="font-semibold text-white">
                {screenInfo.viewportWidth} x {screenInfo.viewportHeight}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Device Pixel Ratio (DPR)</span>
              <span className="font-semibold text-white">{screenInfo.devicePixelRatio}x</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Color Bit Depth</span>
              <span className="font-semibold text-white">{screenInfo.colorDepth} bits</span>
            </div>
          </div>
        </div>

        {/* Browser capabilities */}
        <div className="glass p-5 rounded-xl border border-white/5 space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-nexus-accent flex items-center gap-2">
            <Globe className="w-4 h-4" /> Web Standards & Capabilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 divide-white/5 text-xs">
            <div className="py-2.5 flex justify-between border-b border-white/5">
              <span className="text-slate-400">Browser Languages</span>
              <span className="font-semibold text-white max-w-[60%] truncate">{browserCapabilities.languages}</span>
            </div>
            <div className="py-2.5 flex justify-between border-b border-white/5">
              <span className="text-slate-400">System Timezone</span>
              <span className="font-semibold text-white">{browserCapabilities.timezone}</span>
            </div>
            <div className="py-2.5 flex justify-between border-b border-white/5 sm:border-b-0">
              <span className="text-slate-400">Cookies Enabled</span>
              <span className={`font-semibold ${browserCapabilities.cookiesEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                {browserCapabilities.cookiesEnabled ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between sm:border-b-0">
              <span className="text-slate-400">WebGL Acceleration</span>
              <span className={`font-semibold ${browserCapabilities.webglSupported ? 'text-emerald-400' : 'text-rose-400'}`}>
                {browserCapabilities.webglSupported ? 'SUPPORTED' : 'NOT DETECTED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ToolHistory toolId="client-inspector" />
    </div>
  );
};

export default ClientInspector;
