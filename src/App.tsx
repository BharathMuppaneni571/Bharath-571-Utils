import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { useThemeStore } from './store/useThemeStore';
import AuthCard from './components/AuthCard';
import ThemeBackground from './components/ThemeBackground';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/Dashboard';
import SettingsView from './components/SettingsView';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  JsonFormatter, 
  Base64Converter, 
  TextCaseConverter, 
  HashGenerator, 
  UnitConverter, 
  EntityEncoder, 
  ImageOptimizer,
  Notepad,
  PasswordGenerator,
  UrlShortener,
  DateTimeFormatter,
  ColorPicker,
  JwtSandbox,
  CurlConverter,
  CronGenerator,
  ImageGenerator,
  EpochConverter,
  JsonYamlConverter,
  RegexTester,
  MarkdownEditor,
  MockDataGen,
  CsvJsonConverter,
  BinaryHexConverter,
  FileDetector,
  MimeLookup,
  Img2Pdf,
  QrTool,
  XmlJsonConverter,
  CodeMinifier,
  JsonPathExtractor,
  HandlebarsBinder,
  ODataBuilder,
  QrBatchExport,
  RestApiClient,
  CropResize,
  UrlEncoder,
  CodeDiff,
  IdGenerator,
  ClientInspector
} from './components/tools';


const ToolView: React.FC<{ id: string }> = ({ id }) => {
  const setActiveTool = useAppStore(state => state.setActiveTool);

  switch (id) {
    case 'json': return <JsonFormatter />;
    case 'base64': return <Base64Converter />;
    case 'imgopt': return <ImageOptimizer />;
    case 'hash': return <HashGenerator />;
    case 'unit': return <UnitConverter />;
    case 'case': return <TextCaseConverter />;
    case 'entity': return <EntityEncoder />;
    case 'notepad': return <Notepad />;
    case 'password': return <PasswordGenerator />;
    case 'url-shortener': return <UrlShortener />;
    case 'datetime': return <DateTimeFormatter />;
    case 'color': return <ColorPicker />;
    case 'jwt': return <JwtSandbox />;
    case 'curl': return <CurlConverter />;
    case 'cron': return <CronGenerator />;
    case 'imagegen': return <ImageGenerator />;
    case 'epoch': return <EpochConverter />;
    case 'jsonyaml': return <JsonYamlConverter />;
    case 'regex': return <RegexTester />;
    case 'markdown': return <MarkdownEditor />;
    case 'mockdata': return <MockDataGen />;
    case 'csvjson': return <CsvJsonConverter />;
    case 'binhex': return <BinaryHexConverter />;
    case 'filedetector': return <FileDetector />;
    case 'mimelookup': return <MimeLookup />;
    case 'img2pdf': return <Img2Pdf />;
    case 'qr': return <QrTool />;
    case 'xmljson': return <XmlJsonConverter />;
    case 'minify': return <CodeMinifier />;
    case 'jsonpath': return <JsonPathExtractor />;
    case 'handlebars': return <HandlebarsBinder />;
    case 'odata': return <ODataBuilder />;
    case 'qrpdf': return <QrBatchExport />;
    case 'restapi': return <RestApiClient />;
    case 'cropresize': return <CropResize />;
    case 'url': return <UrlEncoder />;
    case 'codediff': return <CodeDiff />;
    case 'id-generator': return <IdGenerator />;
    case 'client-inspector': return <ClientInspector />;

    case 'settings': return <SettingsView />;
    default:
      return (
        <div className="glass p-10 rounded-3xl text-center">
          <h2 className="text-3xl font-bold mb-4 capitalize">{id.replace('-', ' ')} Tool</h2>
          <p className="text-slate-400">Implementation coming soon.</p>
          <button 
            onClick={() => setActiveTool('dashboard')}
            className="mt-8 px-6 py-2 bg-nexus-accent text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Back to Dashboard
          </button>
        </div>
      );
  }
};

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const checkAuth = useAuthStore(state => state.checkAuth);
  const { activeTool, setActiveTool } = useAppStore();
  const loadTheme = useThemeStore(state => state.loadTheme);
  const loadPinnedTools = useAppStore(state => state.loadPinnedTools);
  const [isExtension, setIsExtension] = useState(false);

  useEffect(() => {
    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user = params.get('username');
    
    if (token && user) {
      const handleOAuth = async () => {
        const { Storage } = await import('./lib/api');
        await Storage.set('bharath_utils_auth_token', token);
        await Storage.set('bharath_utils_username', user);
        window.history.replaceState({}, document.title, "/" + window.location.hash);
        checkAuth();
      };
      handleOAuth();
    } else {
      checkAuth();
    }
    loadTheme();
    loadPinnedTools();
    
    // Check extension context
    // @ts-ignore
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      setIsExtension(true);
    }
  }, [checkAuth, loadTheme, loadPinnedTools]);

  // Deep linking handler
  useEffect(() => {
    const TOOL_MAPPING: Record<string, string> = {
      'b64text': 'base64',
      'pwd': 'password',
      'urlshort': 'url-shortener',
      'detect': 'filedetector',
      'mime': 'mimelookup',
      'hex': 'binhex',
      'colour': 'color',
      'strconvert': 'case',
      'handlebar': 'handlebars'
    };

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        let webId = hash.replace('tile-', '');
        if (TOOL_MAPPING[webId]) {
          webId = TOOL_MAPPING[webId];
        }
        setActiveTool(webId as any);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash(); // Handle initial hash

    return () => window.removeEventListener('hashchange', handleHash);
  }, [setActiveTool]);

  return (
    <div className={`relative ${isExtension ? 'h-[600px] w-[800px] overflow-hidden' : 'min-h-screen'}`}>
      <ThemeBackground />

      {!isAuthenticated ? (
        <main className={`flex items-center justify-center p-4 relative overflow-y-auto ${isExtension ? 'h-[600px] w-[800px]' : 'min-h-screen'}`}>
          <AuthCard />
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-slate-500 text-sm font-medium">
            &copy; 2026 Nexus-571 &bull; Powered by Antigravity
          </div>
        </main>
      ) : (
        <>
          <MainLayout>
            {activeTool === 'dashboard' ? (
              <Dashboard />
            ) : activeTool === 'settings' ? (
              <Dashboard /> // Keep dashboard behind settings
            ) : (
              <ToolView id={activeTool} />
            )}
          </MainLayout>

          {/* Settings Modal Overlay */}
          <AnimatePresence>
            {activeTool === 'settings' && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveTool('dashboard')}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className={`w-full max-w-5xl overflow-y-auto custom-scrollbar relative z-[10000] glass rounded-[40px] shadow-2xl border border-white/20 ${isExtension ? 'max-h-[520px]' : 'max-h-[90vh]'}`}
                >
                  <div className="sticky top-0 right-0 p-6 flex justify-end z-20 pointer-events-none">
                    <button 
                      onClick={() => setActiveTool('dashboard')}
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all pointer-events-auto shadow-lg backdrop-blur-md"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  <div className="px-6 md:px-12 pb-16">
                    <SettingsView />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default App;
