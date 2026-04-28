import React, { useState } from 'react';
import { Copy, Link2, ExternalLink, Scissors, Expand } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const UrlShortener: React.FC = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrlInput, setShortUrlInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { recordAction } = useToolState(
    'url-shortener',
    (values: any) => {
      if (values.longUrl !== undefined) setLongUrl(values.longUrl);
      if (values.shortUrlInput !== undefined) setShortUrlInput(values.shortUrlInput);
      if (values.result !== undefined) setResult(values.result);
    },
    () => ({ longUrl, shortUrlInput, result })
  );

  const shortenUrl = async () => {
    if (!longUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      if (!resp.ok) throw new Error('Failed to shorten URL');
      const short = await resp.text();
      setResult(short);
      recordAction();
    } catch (err: any) {
      setError(err.message);
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const expandUrl = async () => {
    if (!shortUrlInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Note: HEAD request might fail due to CORS in a browser environment
      const resp = await fetch(shortUrlInput, { method: 'HEAD', redirect: 'follow' });
      setResult(resp.url);
      recordAction();
    } catch (err: any) {
      setError('Error expanding URL: ' + err.message + ' (Check CORS)');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link2 className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">URL Shortener / Expander</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Shorten URL</label>
            <div className="relative">
              <input
                type="url"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors"
                placeholder="Paste long URL here..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
              />
              <button
                onClick={shortenUrl}
                disabled={loading || !longUrl}
                className="absolute right-2 top-2 p-2 bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 rounded-lg transition-all disabled:opacity-50"
                title="Shorten"
              >
                <Scissors className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Expand URL</label>
            <div className="relative">
              <input
                type="url"
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pr-12 text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors"
                placeholder="Paste short URL here..."
                value={shortUrlInput}
                onChange={(e) => setShortUrlInput(e.target.value)}
              />
              <button
                onClick={expandUrl}
                disabled={loading || !shortUrlInput}
                className="absolute right-2 top-2 p-2 bg-nexus-violet/20 hover:bg-nexus-violet/30 text-nexus-violet border border-nexus-violet/30 rounded-lg transition-all disabled:opacity-50"
                title="Expand"
              >
                <Expand className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Result</label>
            {result && (
              <button
                onClick={copyToClipboard}
                className="text-xs flex items-center gap-1.5 text-nexus-accent hover:text-nexus-accent/80 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Result
              </button>
            )}
          </div>
          <div className={`w-full h-40 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm break-all flex items-center justify-center text-center ${error ? 'text-red-400' : 'text-slate-300'}`}>
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-nexus-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500">Processing...</span>
              </div>
            ) : error || result || 'Shortened or expanded URL will appear here...'}
          </div>
          {result && !error && (
            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-nexus-accent hover:underline"
            >
              Open URL <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <ToolHistory toolId="url-shortener" />
    </div>
  );
};

export default UrlShortener;
