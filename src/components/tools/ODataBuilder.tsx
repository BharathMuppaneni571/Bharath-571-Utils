import React, { useState, useEffect } from 'react';
import { Database, Copy, Link, Plus, X } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

const ODataBuilder: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('https://services.odata.org/V4/TripPinService/People');
  const [filters, setFilters] = useState<any[]>([]);
  const [select, setSelect] = useState('');
  const [expand, setExpand] = useState('');
  const [orderby, setOrderby] = useState('');
  const [top, setTop] = useState('');
  const [skip, setSkip] = useState('');
  const [finalUrl, setFinalUrl] = useState('');

  const { recordAction } = useToolState(
    'odata',
    () => {},
    () => ({})
  );

  useEffect(() => {
    let url = baseUrl;
    const params = [];

    if (select) params.push(`$select=${select}`);
    if (expand) params.push(`$expand=${expand}`);
    if (orderby) params.push(`$orderby=${orderby}`);
    if (top) params.push(`$top=${top}`);
    if (skip) params.push(`$skip=${skip}`);

    if (filters.length > 0) {
      const filterStr = filters.map(f => `${f.field} ${f.op} ${f.val}`).join(' and ');
      params.push(`$filter=${filterStr}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    setFinalUrl(url);
  }, [baseUrl, select, expand, orderby, top, skip, filters]);

  const addFilter = () => {
    setFilters([...filters, { field: '', op: 'eq', val: '' }]);
    recordAction();
  };

  const removeFilter = (idx: number) => {
    setFilters(filters.filter((_, i) => i !== idx));
  };

  const updateFilter = (idx: number, key: string, val: string) => {
    const newFilters = [...filters];
    newFilters[idx][key] = val;
    setFilters(newFilters);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="glass p-6 md:p-8 rounded-3xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-nexus-accent/20 flex items-center justify-center">
            <Database className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold glow-text tracking-tight">OData Query Builder</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nexus-571 API Engine</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Base Resource URL</label>
            <input
              type="text"
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-5 py-3 font-mono text-sm focus:outline-none focus:border-nexus-accent/50 transition-all text-white"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <InputGroup label="Select Fields" value={select} onChange={setSelect} placeholder="Name, Age" />
                <InputGroup label="Expand Navigation" value={expand} onChange={setExpand} placeholder="Friends, Photo" />
                <InputGroup label="Order By" value={orderby} onChange={setOrderby} placeholder="Age desc" />
             </div>
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <InputGroup label="Top" value={top} onChange={setTop} placeholder="10" />
                   <InputGroup label="Skip" value={skip} onChange={setSkip} placeholder="20" />
                </div>
                
                <div className="space-y-2">
                   <div className="flex justify-between items-center px-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filters</label>
                      <button onClick={addFilter} className="text-nexus-accent hover:text-white transition-colors">
                         <Plus className="w-3.5 h-3.5" />
                      </button>
                   </div>
                   <div className="space-y-2">
                      {filters.map((f, i) => (
                        <div key={i} className="flex gap-2 animate-in slide-in-from-right-2">
                           <input 
                             className="flex-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white" 
                             placeholder="Field"
                             value={f.field}
                             onChange={(e) => updateFilter(i, 'field', e.target.value)}
                           />
                           <select 
                             className="bg-white/5 border border-white/5 rounded-lg px-1 py-1.5 text-xs text-white"
                             value={f.op}
                             onChange={(e) => updateFilter(i, 'op', e.target.value)}
                           >
                              <option value="eq">eq</option>
                              <option value="ne">ne</option>
                              <option value="gt">gt</option>
                              <option value="lt">lt</option>
                              <option value="contains">contains</option>
                           </select>
                           <input 
                             className="flex-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white" 
                             placeholder="Value"
                             value={f.val}
                             onChange={(e) => updateFilter(i, 'val', e.target.value)}
                           />
                           <button onClick={() => removeFilter(i)} className="text-slate-500 hover:text-red-400">
                              <X className="w-4 h-4" />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-2 pt-4">
             <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resulting OData URL</label>
                <button
                  onClick={() => navigator.clipboard.writeText(finalUrl)}
                  className="text-[10px] font-bold text-nexus-accent uppercase tracking-widest flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
             </div>
             <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-5 font-mono text-xs break-all text-slate-300 min-h-[60px] flex items-center gap-3">
                <Link className="w-4 h-4 text-slate-600 shrink-0" />
                <span>{finalUrl}</span>
             </div>
          </div>
        </div>

        <ToolHistory toolId="odata" />
      </div>
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder: string }> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input
      type="text"
      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 font-mono text-xs focus:outline-none focus:border-nexus-accent/50 transition-all text-slate-300"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default ODataBuilder;
