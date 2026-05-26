import React, { useState } from 'react';
import { Columns, Eye, Copy, ArrowLeftRight, Trash2 } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

const CodeDiff: React.FC = () => {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [hasDiffed, setHasDiffed] = useState(false);

  const { recordAction } = useToolState(
    'codediff',
    (values: any) => {
      if (values.leftText !== undefined) setLeftText(values.leftText);
      if (values.rightText !== undefined) setRightText(values.rightText);
      if (values.viewMode !== undefined) setViewMode(values.viewMode);
    },
    () => ({ leftText, rightText, viewMode })
  );

  // A lightweight Longest Common Subsequence line diffing algorithm
  const computeDiff = () => {
    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');
    const m = leftLines.length;
    const n = rightLines.length;

    // DP Table for LCS
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (leftLines[i - 1] === rightLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to build diff
    const result: DiffLine[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
        result.unshift({
          type: 'unchanged',
          value: leftLines[i - 1],
          leftLineNum: i,
          rightLineNum: j,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({
          type: 'added',
          value: rightLines[j - 1],
          rightLineNum: j,
        });
        j--;
      } else {
        result.unshift({
          type: 'removed',
          value: leftLines[i - 1],
          leftLineNum: i,
        });
        i--;
      }
    }

    setDiffResult(result);
    setHasDiffed(true);
    recordAction();
  };

  const clearFields = () => {
    setLeftText('');
    setRightText('');
    setDiffResult([]);
    setHasDiffed(false);
  };

  const copyResult = async () => {
    const text = diffResult
      .map((line) => {
        if (line.type === 'added') return `+ ${line.value}`;
        if (line.type === 'removed') return `- ${line.value}`;
        return `  ${line.value}`;
      })
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-8 h-8 text-nexus-accent animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold glow-text">Code & Text Diff</h2>
            <p className="text-xs text-slate-400">Compare text lines side-by-side or unified.</p>
          </div>
        </div>

        {hasDiffed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'side-by-side' ? 'bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'unified' ? 'bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Unified
            </button>
          </div>
        )}
      </div>

      {!hasDiffed ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Original (Left)</label>
            <textarea
              className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors custom-scrollbar resize-none"
              placeholder="Paste original text here..."
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Modified (Right)</label>
            <textarea
              className="w-full h-80 bg-slate-950/50 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors custom-scrollbar resize-none"
              placeholder="Paste modified text here..."
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/50 border border-white/10 rounded-xl overflow-hidden">
          {viewMode === 'unified' ? (
            <div className="divide-y divide-white/5 font-mono text-xs overflow-x-auto max-h-[500px] custom-scrollbar">
              {diffResult.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-stretch min-w-max py-0.5 ${
                    line.type === 'added'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : line.type === 'removed'
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  <div className="w-12 text-right select-none pr-3 text-slate-600 border-r border-white/5">
                    {line.leftLineNum ?? ''}
                  </div>
                  <div className="w-12 text-right select-none pr-3 text-slate-600 border-r border-white/5">
                    {line.rightLineNum ?? ''}
                  </div>
                  <div className="w-6 text-center select-none text-slate-500 font-bold">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </div>
                  <div className="pl-3 whitespace-pre">{line.value}</div>
                </div>
              ))}
            </div>
          ) : (
            // Side by side rendering
            <div className="grid grid-cols-2 divide-x divide-white/10 font-mono text-xs overflow-x-auto max-h-[500px] custom-scrollbar">
              {/* Left pane */}
              <div className="divide-y divide-white/5">
                {diffResult.map((line, idx) => {
                  if (line.type === 'added') {
                    return (
                      <div key={idx} className="flex items-stretch bg-slate-900/30 text-transparent min-w-max py-0.5 select-none">
                        <div className="w-12 text-right pr-3 text-transparent border-r border-white/5"></div>
                        <div className="pl-3">&nbsp;</div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className={`flex items-stretch min-w-max py-0.5 ${
                        line.type === 'removed' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      <div className="w-12 text-right select-none pr-3 text-slate-600 border-r border-white/5">
                        {line.leftLineNum}
                      </div>
                      <div className="pl-3 whitespace-pre">{line.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Right pane */}
              <div className="divide-y divide-white/5">
                {diffResult.map((line, idx) => {
                  if (line.type === 'removed') {
                    return (
                      <div key={idx} className="flex items-stretch bg-slate-900/30 text-transparent min-w-max py-0.5 select-none">
                        <div className="w-12 text-right pr-3 text-transparent border-r border-white/5"></div>
                        <div className="pl-3">&nbsp;</div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className={`flex items-stretch min-w-max py-0.5 ${
                        line.type === 'added' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      <div className="w-12 text-right select-none pr-3 text-slate-600 border-r border-white/5">
                        {line.rightLineNum}
                      </div>
                      <div className="pl-3 whitespace-pre">{line.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4">
        {!hasDiffed ? (
          <button
            onClick={computeDiff}
            disabled={!leftText && !rightText}
            className="flex-1 bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftRight className="w-4 h-4" /> Compare Text
          </button>
        ) : (
          <>
            <button
              onClick={copyResult}
              className="flex-1 bg-nexus-accent/20 hover:bg-nexus-accent/30 text-nexus-accent border border-nexus-accent/30 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Copy className="w-4 h-4" /> Copy Unified Diff
            </button>
            <button
              onClick={clearFields}
              className="bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 px-6 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Trash2 className="w-4 h-4" /> Reset
            </button>
          </>
        )}
      </div>

      <ToolHistory toolId="codediff" />
    </div>
  );
};

export default CodeDiff;
