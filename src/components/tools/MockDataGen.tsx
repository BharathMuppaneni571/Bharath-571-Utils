import React, { useState } from 'react';
import { Database, Copy, Download, Play } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const MOCK_GENERATORS: { [key: string]: (row: any) => any } = {
  id:        () => Math.floor(Math.random() * 90000) + 10000,
  uuid:      () => crypto.randomUUID(),
  firstName: () => ['Aarav','Priya','Rohan','Meera','Arjun','Divya','Sai','Kavya','Kiran','Anjali'][Math.floor(Math.random()*10)],
  lastName:  () => ['Sharma','Patel','Kumar','Singh','Reddy','Nair','Rao','Iyer','Mehta','Gupta'][Math.floor(Math.random()*10)],
  email:     (row) => `user${row.id || Math.floor(Math.random()*9000+1000)}@example.com`,
  phone:     () => '+91 ' + (Math.floor(Math.random()*9000000000)+1000000000),
  city:      () => ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad'][Math.floor(Math.random()*8)],
  company:   () => ['TechCorp','Innovate Ltd','GlobalSoft','DataSys','CloudBase'][Math.floor(Math.random()*5)],
  salary:    () => Math.floor(Math.random()*90000+30000),
  date:      () => { const d=new Date(Date.now()-Math.random()*3e10); return d.toISOString().split('T')[0]; },
  boolean:   () => Math.random() > 0.5,
  status:    () => ['active','inactive','pending','suspended'][Math.floor(Math.random()*4)]
};

const MockDataGen: React.FC = () => {
  const [rowCount, setRowCount] = useState(10);
  const [format, setFormat] = useState<'sql' | 'json' | 'csv'>('sql');
  const [tableName, setTableName] = useState('Users');
  const [output, setOutput] = useState('');

  const { recordAction } = useToolState(
    'mockdata',
    (values: any) => {
      if (values.rowCount !== undefined) setRowCount(values.rowCount);
      if (values.format !== undefined) setFormat(values.format);
      if (values.tableName !== undefined) setTableName(values.tableName);
    },
    () => ({ rowCount, format, tableName })
  );

  const generateData = () => {
    const cols = ['id','firstName','lastName','email','city','company','date','status'];
    const data = Array.from({length: rowCount}, () => {
      const row: any = {};
      cols.forEach(c => { row[c] = (MOCK_GENERATORS[c] || (() => 'N/A'))(row); });
      return row;
    });

    let result = '';
    if (format === 'json') {
      result = JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      result = cols.join(',') + '\n';
      result += data.map(r => cols.map(c => `"${r[c]}"`).join(',')).join('\n');
    } else {
      result = data.map(r => {
        const vals = cols.map(c => typeof r[c]==='string' ? `'${r[c]}'` : r[c]);
        return `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${vals.join(', ')});`;
      }).join('\n');
    }
    setOutput(result);
    recordAction();
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const downloadFile = () => {
    const ext = format === 'sql' ? 'sql' : (format === 'json' ? 'json' : 'csv');
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName.toLowerCase()}-mock.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <Database className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">Mock Data Generator</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 Data Forge</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Table Name</label>
                 <input
                   type="text"
                   className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white"
                   value={tableName}
                   onChange={(e) => setTableName(e.target.value)}
                 />
               </div>
               <div className="space-y-2">
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rows Count</label>
                 <input
                   type="number"
                   className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white"
                   value={rowCount}
                   min={1}
                   max={100}
                   onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                 />
               </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Output Format</label>
              <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5">
                {(['sql', 'json', 'csv'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase ${format === fmt ? 'bg-nexus-accent text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateData}
              className="w-full py-4 bg-nexus-accent text-slate-900 font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-nexus-accent/20"
            >
              <Play className="w-4 h-4 fill-current" />
              Generate Mock Data
            </button>

            <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-3">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Included Fields</h4>
               <div className="flex flex-wrap gap-2">
                 {['id', 'uuid', 'firstName', 'lastName', 'email', 'phone', 'city', 'company', 'salary', 'date', 'status'].map(f => (
                   <span key={f} className="px-2 py-1 bg-slate-950/50 border border-white/5 rounded text-[10px] text-slate-400 font-mono">{f}</span>
                 ))}
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Generated Output</label>
              <div className="flex gap-2">
                {output && (
                  <>
                    <button
                      onClick={downloadFile}
                      className="text-[10px] font-bold flex items-center gap-1.5 text-slate-400 hover:text-white transition-all uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="text-[10px] font-bold flex items-center gap-1.5 text-nexus-accent hover:text-white transition-all uppercase tracking-widest px-3 py-1 bg-nexus-accent/10 rounded-full"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </>
                )}
              </div>
            </div>
            <pre className="w-full h-[450px] bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-[11px] overflow-auto custom-scrollbar shadow-inner text-slate-300">
              {output || 'Click generate to create mock data...'}
            </pre>
          </div>
        </div>

        <ToolHistory toolId="mockdata" />
      </div>
    </div>
  );
};

export default MockDataGen;
