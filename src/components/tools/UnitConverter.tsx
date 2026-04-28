import React, { useState, useEffect, useCallback } from 'react';
import { Ruler, ArrowRightLeft } from 'lucide-react';
import { useToolState } from '../../store/useToolState';
import ToolHistory from './ToolHistory';

type UnitType = 'length' | 'weight' | 'temperature';

const CONVERSIONS: Record<string, Record<string, number>> = {
  length: {
    meters: 1,
    kilometers: 0.001,
    centimeters: 100,
    millimeters: 1000,
    inches: 39.3701,
    feet: 3.28084,
    yards: 1.09361,
    miles: 0.000621371,
  },
  weight: {
    kilograms: 1,
    grams: 1000,
    milligrams: 1000000,
    pounds: 2.20462,
    ounces: 35.274,
  },
  temperature: {
    celsius: 1,
    fahrenheit: 1,
    kelvin: 1,
  },
};

const UnitConverter: React.FC = () => {
  const [type, setType] = useState<UnitType>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('meters');
  const [toUnit, setToUnit] = useState<string>('kilometers');
  const [outputValue, setOutputValue] = useState<string>('');

  const { recordAction } = useToolState(
    'unit',
    (values: any) => {
      if (values.type !== undefined) setType(values.type);
      if (values.inputValue !== undefined) setInputValue(values.inputValue);
      if (values.fromUnit !== undefined) setFromUnit(values.fromUnit);
      if (values.toUnit !== undefined) setToUnit(values.toUnit);
      if (values.outputValue !== undefined) setOutputValue(values.outputValue);
    },
    () => ({ type, inputValue, fromUnit, toUnit, outputValue })
  );

  const convert = useCallback(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setOutputValue('');
      return;
    }

    let resultValue = '';
    if (type === 'temperature') {
      let result = value;
      // Convert to Celsius first
      if (fromUnit === 'fahrenheit') result = (value - 32) * 5 / 9;
      if (fromUnit === 'kelvin') result = value - 273.15;

      // Convert from Celsius to target
      if (toUnit === 'fahrenheit') result = (result * 9 / 5) + 32;
      if (toUnit === 'kelvin') result = result + 273.15;

      resultValue = result.toFixed(4).replace(/\.?0+$/, '');
    } else {
      const fromRate = CONVERSIONS[type][fromUnit];
      const toRate = CONVERSIONS[type][toUnit];
      const result = (value / fromRate) * toRate;
      resultValue = result.toFixed(6).replace(/\.?0+$/, '');
    }
    setOutputValue(resultValue);
    recordAction();
  }, [inputValue, fromUnit, toUnit, type, recordAction]);

  useEffect(() => {
    // Reset units when type changes
    const units = Object.keys(CONVERSIONS[type]);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  }, [type]);

  useEffect(() => {
    convert();
  }, [convert]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="glass p-6 rounded-2xl w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Ruler className="w-8 h-8 text-nexus-accent" />
        <h2 className="text-2xl font-bold glow-text">Unit Converter</h2>
      </div>

      <div className="flex gap-4 mb-8">
        {(['length', 'weight', 'temperature'] as UnitType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-xl border transition-all capitalize ${
              type === t
                ? 'bg-nexus-accent/20 border-nexus-accent text-nexus-accent'
                : 'bg-slate-900/50 border-white/10 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">From</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-2xl font-bold focus:outline-none focus:border-nexus-accent/50 transition-colors"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-nexus-accent/50 transition-colors capitalize"
          >
            {Object.keys(CONVERSIONS[type]).map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <button
          onClick={swapUnits}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-nexus-accent rounded-full transition-all mt-8"
        >
          <ArrowRightLeft className="w-6 h-6" />
        </button>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">To</label>
          <div className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-2xl font-bold text-nexus-accent overflow-hidden text-ellipsis">
            {outputValue || '0'}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-nexus-accent/50 transition-colors capitalize"
          >
            {Object.keys(CONVERSIONS[type]).map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 p-4 bg-nexus-accent/5 border border-nexus-accent/10 rounded-xl text-center">
        <p className="text-slate-400 text-sm">
          {inputValue} {fromUnit} is equal to <span className="text-nexus-accent font-bold">{outputValue}</span> {toUnit}
        </p>
      </div>

      <ToolHistory toolId="unit" />
    </div>
  );
};

export default UnitConverter;
