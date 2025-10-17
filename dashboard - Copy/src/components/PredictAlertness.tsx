import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { FoodLog } from '../types';

type PredictAlertnessProps = { onNavigate?: (page: string) => void };

export default function PredictAlertness({ onNavigate }: PredictAlertnessProps) {
  const [sleepHours, setSleepHours] = useState('7');
  const [mealTiming, setMealTiming] = useState('');
  const [caffeineInput, setCaffeineInput] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('moderate');
  const [stressLevel, setStressLevel] = useState(5);

  const [inferred, setInferred] = useState<{ timeSinceHours?: number; weight?: 'light' | 'heavy' | 'unknown'; caffeine?: boolean; entry?: FoodLog }>({});
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('foodLogs');
      if (!raw) return;
      const logs: FoodLog[] = JSON.parse(raw);
      if (!Array.isArray(logs) || logs.length === 0) return;
      const last = logs.slice().sort((a, b) => +new Date(b.consumedAt) - +new Date(a.consumedAt))[0];
      const text = `${last.foodName ?? ''} ${(last.notes ?? '')}`.toLowerCase();

      const heavyKeywords = ['burger', 'pizza', 'fried', 'steak', 'pasta', 'curry', 'chips', 'fries', 'ice cream', 'heavy'];
      const lightKeywords = ['salad', 'soup', 'yogurt', 'fruit', 'smoothie', 'sandwich', 'light'];
      const caffeineKeywords = ['coffee', 'espresso', 'latte', 'tea', 'cola', 'energy', 'matcha'];

      const weight: 'light' | 'heavy' | 'unknown' =
        heavyKeywords.some(k => text.includes(k))
          ? 'heavy'
          : lightKeywords.some(k => text.includes(k))
          ? 'light'
          : last.mealType === 'snack'
          ? 'light'
          : 'unknown';

      const caffeine = caffeineKeywords.some(k => text.includes(k));
      const consumed = new Date(last.consumedAt);
      const timeSinceHours = Number.isFinite(consumed.getTime()) ? (Date.now() - consumed.getTime()) / (1000 * 60 * 60) : undefined;

      setInferred({ timeSinceHours, weight, caffeine, entry: last });
    } catch {
      // ignore errors reading localStorage
    }
  }, []);

  const useLastMeal = () => {
    if (!inferred.entry) return;
    setMealTiming(inferred.timeSinceHours ? `${inferred.timeSinceHours.toFixed(1)} hours ago` : '');
    if (inferred.caffeine) setCaffeineInput(prev => (prev ? prev : '1 inferred cup'));
  };

  const computeScore = () => {
    let score = 5;
    const sleep = parseFloat(sleepHours) || 0;
    score += (sleep - 7) * 0.6;
    if (inferred.weight === 'heavy') score -= 1.2;
    else if (inferred.weight === 'light') score += 0.4;
    if (typeof inferred.timeSinceHours === 'number') {
      if (inferred.timeSinceHours < 1) score -= 0.8;
      else if (inferred.timeSinceHours <= 3) score += 0.3;
      else score -= 0.4;
    }
    if (caffeineInput && caffeineInput.trim().length > 0) score += 0.8;
    else if (inferred.caffeine) score += 1.0;
    score -= (stressLevel - 5) * 0.15;
    if (activityLevel === 'active') score += 0.5;
    else if (activityLevel === 'light') score += 0.2;
    return Math.max(1, Math.min(10, Math.round(score)));
  };

  const analyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const score = computeScore();
    const prediction = score >= 8 ? 'High alertness expected' : score >= 5 ? 'Moderate alertness likely' : 'Low alertness predicted';
    const inferredLines = inferred.entry ? `Inferred from last logged meal: ${inferred.entry.foodName ?? 'image-only'} (${inferred.entry.mealType}) at ${new Date(inferred.entry.consumedAt).toLocaleString()}` : '';
    setAnalysis(`Alertness Analysis:\n- Score: ${score}/10\n- Sleep: ${sleepHours} hrs\n- Caffeine (user): ${caffeineInput || 'none'}\n- Inferred caffeine: ${inferred.caffeine ? 'yes' : 'no'}\n- Time since meal: ${inferred.timeSinceHours ? inferred.timeSinceHours.toFixed(1) + ' hrs' : 'unknown'}\n- Meal weight: ${inferred.weight ?? 'unknown'}\n- Activity: ${activityLevel}\n- Stress: ${stressLevel}/10\n\nPrediction: ${prediction}\n\nRecommendations:\n• Maintain regular sleep and light meals.\n• Avoid heavy meals close to important work.\n• Moderate caffeine for sustainable alertness.\n\n${inferredLines}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Predict Alertness</h2>
          </div>

          <form onSubmit={analyze} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sleep Duration (hours)</label>
              <input type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Meal Timing</label>
                <input type="text" value={mealTiming} onChange={(e) => setMealTiming(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
              </div>
              <button type="button" onClick={useLastMeal} className="px-4 py-2 bg-slate-100 rounded-md border">Use Last Meal</button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Caffeine Intake Today</label>
              <input type="text" value={caffeineInput} onChange={(e) => setCaffeineInput(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Activity Level</label>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as any)} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="active">Very Active</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Stress Level (1-10)</label>
              <input type="range" min={1} max={10} value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-red-600 text-white rounded-lg">Analyze</button>
              <button type="button" onClick={() => setAnalysis('')} className="px-6 py-3 bg-slate-100 rounded-lg">Clear</button>
            </div>
          </form>

          {analysis && <pre className="whitespace-pre-wrap mt-6 bg-slate-50 p-4 rounded-md border border-slate-200 text-sm text-slate-800">{analysis}</pre>}
        </div>
      </div>
    </div>
  );
}
/*import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { FoodLog } from '../types';

type PredictAlertnessProps = { onNavigate?: (page: string) => void };

export default function PredictAlertness({ onNavigate }: PredictAlertnessProps) {
  const [sleepHours, setSleepHours] = useState('7');
  const [mealTiming, setMealTiming] = useState('');
  const [caffeineInput, setCaffeineInput] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('moderate');
  const [stressLevel, setStressLevel] = useState(5);

  const [inferred, setInferred] = useState<{ timeSinceHours?: number; weight?: 'light' | 'heavy' | 'unknown'; caffeine?: boolean; entry?: FoodLog }>({});
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('foodLogs');
      if (!raw) return;
      const logs: FoodLog[] = JSON.parse(raw);
      if (!Array.isArray(logs) || logs.length === 0) return;
      const last = logs.slice().sort((a, b) => +new Date(b.consumedAt) - +new Date(a.consumedAt))[0];
      const text = `${last.foodName ?? ''} ${(last.notes ?? '')}`.toLowerCase();
      const heavyKeywords = ['burger', 'pizza', 'fried', 'steak', 'pasta', 'curry', 'chips', 'fries', 'ice cream', 'heavy'];
      const lightKeywords = ['salad', 'soup', 'yogurt', 'fruit', 'smoothie', 'sandwich', 'light'];
      const caffeineKeywords = ['coffee', 'espresso', 'latte', 'tea', 'cola', 'energy', 'matcha'];
      const weight: 'light' | 'heavy' | 'unknown' = heavyKeywords.some(k => text.includes(k)) ? 'heavy' : lightKeywords.some(k => text.includes(k)) ? 'light' : last.mealType === 'snack' ? 'light' : 'unknown';
      const caffeine = caffeineKeywords.some(k => text.includes(k));
      const consumed = new Date(last.consumedAt);
      const timeSinceHours = Number.isFinite(consumed.getTime()) ? (Date.now() - consumed.getTime()) / (1000 * 60 * 60) : undefined;
      setInferred({ timeSinceHours, weight, caffeine, entry: last });
    } catch {
      // ignore
    }
  }, []);

  const useLastMeal = () => {
    if (!inferred.entry) return;
    setMealTiming(inferred.timeSinceHours ? `${inferred.timeSinceHours.toFixed(1)} hours ago` : '');
    if (inferred.caffeine) setCaffeineInput(prev => (prev ? prev : '1 inferred cup'));
  };

  const computeScore = () => {
    let score = 5;
    const sleep = parseFloat(sleepHours) || 0;
    score += (sleep - 7) * 0.6;
    if (inferred.weight === 'heavy') score -= 1.2;
    else if (inferred.weight === 'light') score += 0.4;
    if (typeof inferred.timeSinceHours === 'number') {
      if (inferred.timeSinceHours < 1) score -= 0.8;
      else if (inferred.timeSinceHours <= 3) score += 0.3;
      else score -= 0.4;
    }
    if (caffeineInput && caffeineInput.trim().length > 0) score += 0.8;
    else if (inferred.caffeine) score += 1.0;
    score -= (stressLevel - 5) * 0.15;
    if (activityLevel === 'active') score += 0.5;
    else if (activityLevel === 'light') score += 0.2;
    return Math.max(1, Math.min(10, Math.round(score)));
  };

  const analyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const score = computeScore();
    const prediction = score >= 8 ? 'High alertness expected' : score >= 5 ? 'Moderate alertness likely' : 'Low alertness predicted';
    const inferredLines = inferred.entry ? `Inferred from last logged meal: ${inferred.entry.foodName ?? 'image-only'} (${inferred.entry.mealType}) at ${new Date(inferred.entry.consumedAt).toLocaleString()}` : '';
    setAnalysis(`Score: ${score}/10\nPrediction: ${prediction}\n\n${inferredLines}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Predict Alertness</h2>
          </div>

          <form onSubmit={analyze} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sleep Duration (hours)</label>
              <input type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Meal Timing</label>
                <input type="text" value={mealTiming} onChange={(e) => setMealTiming(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
              </div>
              <button type="button" onClick={useLastMeal} className="px-4 py-2 bg-slate-100 rounded-md border">Use Last Meal</button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Caffeine Intake Today</label>
              <input type="text" value={caffeineInput} onChange={(e) => setCaffeineInput(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Activity Level</label>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as any)} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="active">Very Active</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Stress Level (1-10)</label>
              <input type="range" min={1} max={10} value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-red-600 text-white rounded-lg">Analyze</button>
              <button type="button" onClick={() => setAnalysis('')} className="px-6 py-3 bg-slate-100 rounded-lg">Clear</button>
            </div>
          </form>

          {analysis && <pre className="whitespace-pre-wrap mt-6 bg-slate-50 p-4 rounded-md border border-slate-200 text-sm text-slate-800">{analysis}</pre>}
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { FoodLog } from '../types';

type PredictAlertnessProps = { onNavigate?: (page: string) => void };

export default function PredictAlertness({ onNavigate }: PredictAlertnessProps) {
  const [sleepHours, setSleepHours] = useState('7');
  const [mealTiming, setMealTiming] = useState('');
  const [caffeineInput, setCaffeineInput] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('moderate');
  const [stressLevel, setStressLevel] = useState(5);

  const [inferred, setInferred] = useState<{ timeSinceHours?: number; weight?: 'light' | 'heavy' | 'unknown'; caffeine?: boolean; entry?: FoodLog }>({});
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('foodLogs');
      if (!raw) return;
      const logs: FoodLog[] = JSON.parse(raw);
      if (!Array.isArray(logs) || logs.length === 0) return;
      import React, { useEffect, useState } from 'react';
      import { ArrowLeft, AlertCircle } from 'lucide-react';
      import { FoodLog } from '../types';

      type PredictAlertnessProps = { onNavigate?: (page: string) => void };

      export default function PredictAlertness({ onNavigate }: PredictAlertnessProps) {
        const [sleepHours, setSleepHours] = useState('7');
        const [mealTiming, setMealTiming] = useState('');
        const [caffeineInput, setCaffeineInput] = useState('');
        const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('moderate');
        const [stressLevel, setStressLevel] = useState(5);

        const [inferred, setInferred] = useState<{ timeSinceHours?: number; weight?: 'light' | 'heavy' | 'unknown'; caffeine?: boolean; entry?: FoodLog }>({});
        const [analysis, setAnalysis] = useState('');

        useEffect(() => {
          try {
            const raw = localStorage.getItem('foodLogs');
            if (!raw) return;
            const logs: FoodLog[] = JSON.parse(raw);
            if (!Array.isArray(logs) || logs.length === 0) return;
            const last = logs.slice().sort((a, b) => +new Date(b.consumedAt) - +new Date(a.consumedAt))[0];
            const text = `${last.foodName ?? ''} ${(last.notes ?? '')}`.toLowerCase();
            const heavyKeywords = ['burger', 'pizza', 'fried', 'steak', 'pasta', 'curry', 'chips', 'fries', 'ice cream', 'heavy'];
            const lightKeywords = ['salad', 'soup', 'yogurt', 'fruit', 'smoothie', 'sandwich', 'light'];
            const caffeineKeywords = ['coffee', 'espresso', 'latte', 'tea', 'cola', 'energy', 'matcha'];
            const weight: 'light' | 'heavy' | 'unknown' = heavyKeywords.some(k => text.includes(k)) ? 'heavy' : lightKeywords.some(k => text.includes(k)) ? 'light' : last.mealType === 'snack' ? 'light' : 'unknown';
            const caffeine = caffeineKeywords.some(k => text.includes(k));
            const consumed = new Date(last.consumedAt);
            const timeSinceHours = Number.isFinite(consumed.getTime()) ? (Date.now() - consumed.getTime()) / (1000 * 60 * 60) : undefined;
            setInferred({ timeSinceHours, weight, caffeine, entry: last });
          } catch {
            // ignore
          }
        }, []);

        const useLastMeal = () => {
          if (!inferred.entry) return;
          setMealTiming(inferred.timeSinceHours ? `${inferred.timeSinceHours.toFixed(1)} hours ago` : '');
          if (inferred.caffeine) setCaffeineInput(prev => (prev ? prev : '1 inferred cup'));
        };

        const computeScore = () => {
          let score = 5;
          const sleep = parseFloat(sleepHours) || 0;
          score += (sleep - 7) * 0.6;
          if (inferred.weight === 'heavy') score -= 1.2;
          else if (inferred.weight === 'light') score += 0.4;
          if (typeof inferred.timeSinceHours === 'number') {
            if (inferred.timeSinceHours < 1) score -= 0.8;
            else if (inferred.timeSinceHours <= 3) score += 0.3;
            else score -= 0.4;
          }
          if (caffeineInput && caffeineInput.trim().length > 0) score += 0.8;
          else if (inferred.caffeine) score += 1.0;
          score -= (stressLevel - 5) * 0.15;
          if (activityLevel === 'active') score += 0.5;
          else if (activityLevel === 'light') score += 0.2;
          return Math.max(1, Math.min(10, Math.round(score)));
        };

        const analyze = (e?: React.FormEvent) => {
          if (e) e.preventDefault();
          const score = computeScore();
          const prediction = score >= 8 ? 'High alertness expected' : score >= 5 ? 'Moderate alertness likely' : 'Low alertness predicted';
          const inferredLines = inferred.entry ? `Inferred from last logged meal: ${inferred.entry.foodName ?? 'image-only'} (${inferred.entry.mealType}) at ${new Date(inferred.entry.consumedAt).toLocaleString()}` : '';
          setAnalysis(`Score: ${score}/10\nPrediction: ${prediction}\n\n${inferredLines}`);
        };

        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
              <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>

              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Predict Alertness</h2>
                </div>

                <form onSubmit={analyze} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sleep Duration (hours)</label>
                    <input type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Last Meal Timing</label>
                      <input type="text" value={mealTiming} onChange={(e) => setMealTiming(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                    </div>
                    <button type="button" onClick={useLastMeal} className="px-4 py-2 bg-slate-100 rounded-md border">Use Last Meal</button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Caffeine Intake Today</label>
                    <input type="text" value={caffeineInput} onChange={(e) => setCaffeineInput(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Activity Level</label>
                    <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as any)} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light Activity</option>
                      <option value="moderate">Moderate Activity</option>
                      <option value="active">Very Active</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Stress Level (1-10)</label>
                    <input type="range" min={1} max={10} value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full" />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-3 bg-red-600 text-white rounded-lg">Analyze</button>
                    <button type="button" onClick={() => setAnalysis('')} className="px-6 py-3 bg-slate-100 rounded-lg">Clear</button>
                  </div>
                </form>

                {analysis && <pre className="whitespace-pre-wrap mt-6 bg-slate-50 p-4 rounded-md border border-slate-200 text-sm text-slate-800">{analysis}</pre>}
              </div>
            </div>
          </div>
        );
      }

                              const logs: FoodLog[] = JSON.parse(raw || '[]');
                              if (!Array.isArray(logs) || logs.length === 0) return;
                              const last = logs.slice().sort((a, b) => +new Date(b.consumedAt) - +new Date(a.consumedAt))[0];
                              const text = `${last.foodName ?? ''} ${(last.notes ?? '')}`.toLowerCase();
                              const heavyKeywords = ['burger', 'pizza', 'fried', 'steak', 'pasta', 'curry', 'chips', 'fries', 'ice cream', 'heavy'];
                              const lightKeywords = ['salad', 'soup', 'yogurt', 'fruit', 'smoothie', 'sandwich', 'light'];
                              const caffeineKeywords = ['coffee', 'espresso', 'latte', 'tea', 'cola', 'energy'];
                              const weight = heavyKeywords.some(k => text.includes(k)) ? 'heavy' : lightKeywords.some(k => text.includes(k)) ? 'light' : last.mealType === 'snack' ? 'light' : 'unknown';
                              const caffeine = caffeineKeywords.some(k => text.includes(k));
                              const timeSinceHours = (Date.now() - new Date(last.consumedAt).getTime()) / (1000 * 60 * 60);
                              setInferred({ timeSinceHours, weight, caffeine, entry: last });
                            } catch (err) {
                              // ignore
                            }
                          }, []);

                          const useLastMeal = () => {
                            if (!inferred.entry) return;
                            setMealTiming(inferred.timeSinceHours ? `${inferred.timeSinceHours.toFixed(1)} hours ago` : '');
                            if (inferred.caffeine) setCaffeineInput(prev => (prev ? prev : '1 inferred cup'));
                          };

                          const computeScore = () => {
                            let score = 5;
                            const sleep = parseFloat(sleepHours) || 0;
                            score += (sleep - 7) * 0.6;
                            if (inferred.weight === 'heavy') score -= 1.2;
                            else if (inferred.weight === 'light') score += 0.4;
                            if (typeof inferred.timeSinceHours === 'number') {
                              if (inferred.timeSinceHours < 1) score -= 0.8;
                              else if (inferred.timeSinceHours <= 3) score += 0.3;
                              else score -= 0.4;
                            }
                            if (caffeineInput && caffeineInput.trim().length > 0) score += 0.8;
                            else if (inferred.caffeine) score += 1.0;
                            score -= (stressLevel - 5) * 0.15;
                            if (activityLevel === 'active') score += 0.5;
                            else if (activityLevel === 'light') score += 0.2;
                            return Math.max(1, Math.min(10, Math.round(score)));
                          };

                          const analyze = (e?: React.FormEvent) => {
                            if (e) e.preventDefault();
                            const score = computeScore();
                            const prediction = score >= 8 ? 'High alertness expected' : score >= 5 ? 'Moderate alertness likely' : 'Low alertness predicted';
                            const inferredLines = inferred.entry ? `Inferred from last logged meal: ${inferred.entry.foodName ?? 'image-only'} (${inferred.entry.mealType}) at ${new Date(inferred.entry.consumedAt).toLocaleString()}` : '';
                            setAnalysis(`Alertness Analysis:\n- Score: ${score}/10\n- Sleep: ${sleepHours} hrs\n- Caffeine (user): ${caffeineInput || 'none'}\n- Inferred caffeine: ${inferred.caffeine ? 'yes' : 'no'}\n- Time since meal: ${inferred.timeSinceHours ? inferred.timeSinceHours.toFixed(1) + ' hrs' : 'unknown'}\n- Meal weight: ${inferred.weight ?? 'unknown'}\n- Activity: ${activityLevel}\n- Stress: ${stressLevel}/10\n\nPrediction: ${prediction}\n\nRecommendations:\n• Keep regular meals and sleep\n• Prefer lighter meals before important tasks\n• Use caffeine strategically\n\n${inferredLines}`);
                          };

                          return (
                            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                              <div className="container mx-auto px-4 py-8">
                                <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors">
                                  <ArrowLeft className="w-5 h-5" />
                                  <span className="font-medium">Back to Dashboard</span>
                                </button>

                                <div className="max-w-4xl mx-auto">
                                  <h1 className="text-4xl font-bold text-slate-800 mb-8">Predict Alertness</h1>

                                  <div className="bg-white rounded-2xl shadow-lg p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                      <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                        <AlertCircle className="w-6 h-6 text-white" />
                                      </div>
                                      <h2 className="text-2xl font-bold text-slate-800">Analyze Alertness Patterns</h2>
                                    </div>

                                    <form onSubmit={analyze} className="space-y-6">
                                      <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Sleep Duration (hours)</label>
                                        <input type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" placeholder="e.g., 7.5" />
                                      </div>

                                      <div className="flex gap-3 items-center">
                                        <div className="flex-1">
                                          <label className="block text-sm font-semibold text-slate-700 mb-2">Last Meal Timing</label>
                                          <input type="text" value={mealTiming} onChange={(e) => setMealTiming(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" placeholder="e.g., 2 hours ago" />
                                        </div>
                                        <button type="button" onClick={useLastMeal} className="px-4 py-2 bg-slate-100 rounded-md border">Use Last Meal</button>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Caffeine Intake Today</label>
                                        <input type="text" value={caffeineInput} onChange={(e) => setCaffeineInput(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" placeholder="e.g., 2 cups of coffee" />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Activity Level</label>
                                        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                                          <option value="sedentary">Sedentary</option>
                                          <option value="light">Light Activity</option>
                                          <option value="moderate">Moderate Activity</option>
                                          <option value="active">Very Active</option>
                                        </select>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Stress Level (1-10)</label>
                                        <input type="range" min={1} max={10} value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full" />
                                      </div>

                                      <div className="flex gap-3">
                                        <button type="submit" className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold">Analyze</button>
                                        <button type="button" onClick={() => setAnalysis('')} className="px-6 py-3 bg-slate-100 rounded-lg">Clear</button>
                                      </div>
                                    </form>

                                    {analysis && <pre className="whitespace-pre-wrap mt-6 bg-slate-50 p-4 rounded-md border border-slate-200 text-sm text-slate-800">{analysis}</pre>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                                      <input type="range" min="1" max="10" value={formData.stressLevel} onChange={(e) => setFormData(prev => ({ ...prev, stressLevel: e.target.value }))} className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
                                      <span className="text-2xl font-bold text-red-600 w-12 text-center">{formData.stressLevel}</span>
                                    </div>
                                  </div>

                                  <button type="submit" className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl">Predict Alertness</button>

                                </form>

                                {result && (
                                  <div className="mt-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                    <h3 className="font-bold text-slate-800 mb-3 text-lg">Alertness Prediction</h3>
                                    <pre className="text-slate-700 whitespace-pre-wrap font-sans">{result}</pre>
                                  </div>
                                )}

                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, activityLevel: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Activity</option>
                  <option value="moderate">Moderate Activity</option>
                  <option value="active">Very Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Stress Level (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    import React, { useEffect, useState } from 'react';
                    import { ArrowLeft, AlertCircle } from 'lucide-react';
                    import { FoodLog } from '../types';

                    type PredictAlertnessProps = { onNavigate: (page: string) => void };

                    export default function PredictAlertness({ onNavigate }: PredictAlertnessProps) {
                      const [sleepHours, setSleepHours] = useState('7');
                      const [mealTiming, setMealTiming] = useState('');
                      const [caffeineInput, setCaffeineInput] = useState('');
                      const [activityLevel, setActivityLevel] = useState('moderate');
                      const [stressLevel, setStressLevel] = useState(5);

                      const [inferred, setInferred] = useState<{ timeSinceHours?: number; weight?: 'light' | 'heavy' | 'unknown'; caffeine?: boolean; entry?: FoodLog }>({});
                      const [analysis, setAnalysis] = useState('');

                      useEffect(() => {
                        const raw = localStorage.getItem('foodLogs');
                        if (!raw) return;
                        try {
                          const logs: FoodLog[] = JSON.parse(raw || '[]');
                          if (!Array.isArray(logs) || logs.length === 0) return;
                          const last = logs.slice().sort((a, b) => +new Date(b.consumedAt) - +new Date(a.consumedAt))[0];
                          const text = `${last.foodName ?? ''} ${(last.notes ?? '')}`.toLowerCase();
                          const heavyKeywords = ['burger', 'pizza', 'fried', 'steak', 'pasta', 'curry', 'chips', 'fries', 'ice cream', 'heavy'];
                          const lightKeywords = ['salad', 'soup', 'yogurt', 'fruit', 'smoothie', 'sandwich', 'light'];
                          const caffeineKeywords = ['coffee', 'espresso', 'latte', 'tea', 'cola', 'energy'];
                          const weight = heavyKeywords.some(k => text.includes(k)) ? 'heavy' : lightKeywords.some(k => text.includes(k)) ? 'light' : last.mealType === 'snack' ? 'light' : 'unknown';
                          const caffeine = caffeineKeywords.some(k => text.includes(k));
                          const timeSinceHours = (Date.now() - new Date(last.consumedAt).getTime()) / (1000 * 60 * 60);
                          setInferred({ timeSinceHours, weight, caffeine, entry: last });
                        } catch (err) {
                          // ignore
                        }
                      }, []);

                      const useLastMeal = () => {
                        if (!inferred.entry) return;
                        setMealTiming(inferred.timeSinceHours ? `${inferred.timeSinceHours.toFixed(1)} hours ago` : '');
                        if (inferred.caffeine) setCaffeineInput(prev => (prev ? prev : '1 inferred cup'));
                      };

                      const computeScore = () => {
                        let score = 5;
                        const sleep = parseFloat(sleepHours) || 0;
                        score += (sleep - 7) * 0.6;
                        if (inferred.weight === 'heavy') score -= 1.2;
                        else if (inferred.weight === 'light') score += 0.4;
                        if (typeof inferred.timeSinceHours === 'number') {
                          if (inferred.timeSinceHours < 1) score -= 0.8;
                          else if (inferred.timeSinceHours <= 3) score += 0.3;
                          else score -= 0.4;
                        }
                        if (caffeineInput && caffeineInput.trim().length > 0) score += 0.8;
                        else if (inferred.caffeine) score += 1.0;
                        score -= (stressLevel - 5) * 0.15;
                        if (activityLevel === 'active') score += 0.5;
                        else if (activityLevel === 'light') score += 0.2;
                        return Math.max(1, Math.min(10, Math.round(score)));
                      };

                      const analyze = (e?: React.FormEvent) => {
                        if (e) e.preventDefault();
                        const score = computeScore();
                        const prediction = score >= 8 ? 'High alertness expected' : score >= 5 ? 'Moderate alertness likely' : 'Low alertness predicted';
                        const inferredLines = inferred.entry ? `Inferred from last logged meal: ${inferred.entry.foodName ?? 'image-only'} (${inferred.entry.mealType}) at ${new Date(inferred.entry.consumedAt).toLocaleString()}` : '';
                        setAnalysis(`Alertness Analysis:\n- Score: ${score}/10\n- Sleep: ${sleepHours} hrs\n- Caffeine (user): ${caffeineInput || 'none'}\n- Inferred caffeine: ${inferred.caffeine ? 'yes' : 'no'}\n- Time since meal: ${inferred.timeSinceHours ? inferred.timeSinceHours.toFixed(1) + ' hrs' : 'unknown'}\n- Meal weight: ${inferred.weight ?? 'unknown'}\n- Activity: ${activityLevel}\n- Stress: ${stressLevel}/10\n\nPrediction: ${prediction}\n\nRecommendations:\n• Keep regular meals and sleep\n• Prefer lighter meals before important tasks\n• Use caffeine strategically\n\n${inferredLines}`);
                      };

                      return (
                        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                          <div className="container mx-auto px-4 py-8">
                            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors">
                              <ArrowLeft className="w-5 h-5" />
                              <span className="font-medium">Back to Dashboard</span>
                            </button>

                            <div className="max-w-4xl mx-auto">
                              <h1 className="text-4xl font-bold text-slate-800 mb-8">Predict Alertness</h1>

                              <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                  </div>
                                  <h2 className="text-2xl font-bold text-slate-800">Analyze Alertness Patterns</h2>
                                </div>

                                <form onSubmit={analyze} className="space-y-6">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sleep Duration (hours)</label>
                                    <input type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" placeholder="e.g., 7.5" />
                                  </div>

                                  <div className="flex gap-3 items-center">
                                    <div className="flex-1">
                                      <label className="block text-sm font-semibold text-slate-700 mb-2">Last Meal Timing</label>
                                      <input type="text" value={mealTiming} onChange={(e) => setMealTiming(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" placeholder="e.g., 2 hours ago" />
                                    </div>
                                    <button type="button" onClick={useLastMeal} className="px-4 py-2 bg-slate-100 rounded-md border">Use Last Meal</button>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Caffeine Intake Today</label>
                                    <input type="text" value={caffeineInput} onChange={(e) => setCaffeineInput(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" placeholder="e.g., 2 cups of coffee" />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Activity Level</label>
                                    <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                                      <option value="sedentary">Sedentary</option>
                                      <option value="light">Light Activity</option>
                                      <option value="moderate">Moderate Activity</option>
                                      <option value="active">Very Active</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Stress Level (1-10)</label>
                                    <input type="range" min={1} max={10} value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full" />
                                  </div>

                                  <div className="flex gap-3">
                                    <button type="submit" className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold">Analyze</button>
                                    <button type="button" onClick={() => setAnalysis('')} className="px-6 py-3 bg-slate-100 rounded-lg">Clear</button>
                                  </div>
                                </form>

                                {analysis && <pre className="whitespace-pre-wrap mt-6 bg-slate-50 p-4 rounded-md border border-slate-200 text-sm text-slate-800">{analysis}</pre>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }*/
     import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { FoodLog } from '../types';

type PredictAlertnessProps = {
  onNavigate?: (page: string) => void;
};

export default function PredictAlertness({ onNavigate }: PredictAlertnessProps) {
  const [sleepHours, setSleepHours] = useState('7');
  const [mealTiming, setMealTiming] = useState('');
  const [caffeineInput, setCaffeineInput] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('moderate');
  const [stressLevel, setStressLevel] = useState(5);

  const [inferred, setInferred] = useState<{ 
    timeSinceHours?: number; 
    weight?: 'light' | 'heavy' | 'unknown'; 
    caffeine?: boolean; 
    entry?: FoodLog 
  }>({});
  
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('foodLogs');
      if (!raw) return;
      const logs: FoodLog[] = JSON.parse(raw);
      if (!Array.isArray(logs) || logs.length === 0) return;

      const last = logs.slice().sort((a, b) => +new Date(b.consumedAt) - +new Date(a.consumedAt))[0];
      const text = `${last.foodName ?? ''} ${(last.notes ?? '')}`.toLowerCase();

      const heavyKeywords = ['burger', 'pizza', 'fried', 'steak', 'pasta', 'curry', 'chips', 'fries', 'ice cream', 'heavy'];
      const lightKeywords = ['salad', 'soup', 'yogurt', 'fruit', 'smoothie', 'sandwich', 'light'];
      const caffeineKeywords = ['coffee', 'espresso', 'latte', 'tea', 'cola', 'energy', 'matcha'];

      const weight: 'light' | 'heavy' | 'unknown' =
        heavyKeywords.some(k => text.includes(k))
          ? 'heavy'
          : lightKeywords.some(k => text.includes(k))
          ? 'light'
          : last.mealType === 'snack'
          ? 'light'
          : 'unknown';

      const caffeine = caffeineKeywords.some(k => text.includes(k));
      const consumed = new Date(last.consumedAt);
      const timeSinceHours = Number.isFinite(consumed.getTime())
        ? (Date.now() - consumed.getTime()) / (1000 * 60 * 60)
        : undefined;

      setInferred({ timeSinceHours, weight, caffeine, entry: last });
    } catch {
      // ignore errors
    }
  }, []);

  const useLastMeal = () => {
    if (!inferred.entry) return;
    setMealTiming(inferred.timeSinceHours ? `${inferred.timeSinceHours.toFixed(1)} hours ago` : '');
    if (inferred.caffeine) setCaffeineInput(prev => (prev ? prev : '1 inferred cup'));
  };

  const computeScore = () => {
    let score = 5;
    const sleep = parseFloat(sleepHours) || 0;
    score += (sleep - 7) * 0.6;

    if (inferred.weight === 'heavy') score -= 1.2;
    else if (inferred.weight === 'light') score += 0.4;

    if (typeof inferred.timeSinceHours === 'number') {
      if (inferred.timeSinceHours < 1) score -= 0.8;
      else if (inferred.timeSinceHours <= 3) score += 0.3;
      else score -= 0.4;
    }

    if (caffeineInput && caffeineInput.trim().length > 0) score += 0.8;
    else if (inferred.caffeine) score += 1.0;

    score -= (stressLevel - 5) * 0.15;

    if (activityLevel === 'active') score += 0.5;
    else if (activityLevel === 'light') score += 0.2;

    return Math.max(1, Math.min(10, Math.round(score)));
  };

  const analyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const score = computeScore();
    const prediction =
      score >= 8
        ? 'High alertness expected'
        : score >= 5
        ? 'Moderate alertness likely'
        : 'Low alertness predicted';
    const inferredLines = inferred.entry
      ? `Inferred from last logged meal: ${inferred.entry.foodName ?? 'image-only'} (${inferred.entry.mealType}) at ${new Date(inferred.entry.consumedAt).toLocaleString()}`
      : '';

    setAnalysis(
      `Alertness Analysis:
- Score: ${score}/10
- Sleep: ${sleepHours} hrs
- Caffeine (user): ${caffeineInput || 'none'}
- Inferred caffeine: ${inferred.caffeine ? 'yes' : 'no'}
- Time since meal: ${inferred.timeSinceHours ? inferred.timeSinceHours.toFixed(1) + ' hrs' : 'unknown'}
- Meal weight: ${inferred.weight ?? 'unknown'}
- Activity: ${activityLevel}
- Stress: ${stressLevel}/10

Prediction: ${prediction}

Recommendations:
• Maintain regular sleep and light meals.
• Avoid heavy meals close to important work.
import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { FoodLog } from '../types';

type PredictAlertnessProps = { onNavigate?: (page: string) => void };

export default function PredictAlertness({ onNavigate }: PredictAlertnessProps) {
  const [sleepHours, setSleepHours] = useState('7');
  const [mealTiming, setMealTiming] = useState('');
  const [caffeineInput, setCaffeineInput] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('moderate');
  const [stressLevel, setStressLevel] = useState(5);

  const [inferred, setInferred] = useState<{ timeSinceHours?: number; weight?: 'light' | 'heavy' | 'unknown'; caffeine?: boolean; entry?: FoodLog }>({});
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('foodLogs');
      if (!raw) return;
      const logs: FoodLog[] = JSON.parse(raw);
      if (!Array.isArray(logs) || logs.length === 0) return;
      const last = logs.slice().sort((a, b) => +new Date(b.consumedAt) - +new Date(a.consumedAt))[0];
      const text = `${last.foodName ?? ''} ${(last.notes ?? '')}`.toLowerCase();

      const heavyKeywords = ['burger', 'pizza', 'fried', 'steak', 'pasta', 'curry', 'chips', 'fries', 'ice cream', 'heavy'];
      const lightKeywords = ['salad', 'soup', 'yogurt', 'fruit', 'smoothie', 'sandwich', 'light'];
      const caffeineKeywords = ['coffee', 'espresso', 'latte', 'tea', 'cola', 'energy', 'matcha'];

      const weight: 'light' | 'heavy' | 'unknown' =
        heavyKeywords.some(k => text.includes(k))
          ? 'heavy'
          : lightKeywords.some(k => text.includes(k))
          ? 'light'
          : last.mealType === 'snack'
          ? 'light'
          : 'unknown';

      const caffeine = caffeineKeywords.some(k => text.includes(k));
      const consumed = new Date(last.consumedAt);
      const timeSinceHours = Number.isFinite(consumed.getTime()) ? (Date.now() - consumed.getTime()) / (1000 * 60 * 60) : undefined;

      setInferred({ timeSinceHours, weight, caffeine, entry: last });
    } catch {
      // ignore errors reading localStorage
    }
  }, []);

  const useLastMeal = () => {
    if (!inferred.entry) return;
    setMealTiming(inferred.timeSinceHours ? `${inferred.timeSinceHours.toFixed(1)} hours ago` : '');
    if (inferred.caffeine) setCaffeineInput(prev => (prev ? prev : '1 inferred cup'));
  };

  const computeScore = () => {
    let score = 5;
    const sleep = parseFloat(sleepHours) || 0;
    score += (sleep - 7) * 0.6;
    if (inferred.weight === 'heavy') score -= 1.2;
    else if (inferred.weight === 'light') score += 0.4;
    if (typeof inferred.timeSinceHours === 'number') {
      if (inferred.timeSinceHours < 1) score -= 0.8;
      else if (inferred.timeSinceHours <= 3) score += 0.3;
      else score -= 0.4;
    }
    if (caffeineInput && caffeineInput.trim().length > 0) score += 0.8;
    else if (inferred.caffeine) score += 1.0;
    score -= (stressLevel - 5) * 0.15;
    if (activityLevel === 'active') score += 0.5;
    else if (activityLevel === 'light') score += 0.2;
    return Math.max(1, Math.min(10, Math.round(score)));
  };

  const analyze = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const score = computeScore();
    const prediction = score >= 8 ? 'High alertness expected' : score >= 5 ? 'Moderate alertness likely' : 'Low alertness predicted';
    const inferredLines = inferred.entry ? `Inferred from last logged meal: ${inferred.entry.foodName ?? 'image-only'} (${inferred.entry.mealType}) at ${new Date(inferred.entry.consumedAt).toLocaleString()}` : '';
    setAnalysis(`Alertness Analysis:\n- Score: ${score}/10\n- Sleep: ${sleepHours} hrs\n- Caffeine (user): ${caffeineInput || 'none'}\n- Inferred caffeine: ${inferred.caffeine ? 'yes' : 'no'}\n- Time since meal: ${inferred.timeSinceHours ? inferred.timeSinceHours.toFixed(1) + ' hrs' : 'unknown'}\n- Meal weight: ${inferred.weight ?? 'unknown'}\n- Activity: ${activityLevel}\n- Stress: ${stressLevel}/10\n\nPrediction: ${prediction}\n\nRecommendations:\n• Maintain regular sleep and light meals.\n• Avoid heavy meals close to important work.\n• Moderate caffeine for sustainable alertness.\n\n${inferredLines}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Predict Alertness</h2>
          </div>

          <form onSubmit={analyze} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sleep Duration (hours)</label>
              <input type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Meal Timing</label>
                <input type="text" value={mealTiming} onChange={(e) => setMealTiming(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
              </div>
              <button type="button" onClick={useLastMeal} className="px-4 py-2 bg-slate-100 rounded-md border">Use Last Meal</button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Caffeine Intake Today</label>
              <input type="text" value={caffeineInput} onChange={(e) => setCaffeineInput(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Activity Level</label>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as any)} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="active">Very Active</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Stress Level (1-10)</label>
              <input type="range" min={1} max={10} value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-red-600 text-white rounded-lg">Analyze</button>
              <button type="button" onClick={() => setAnalysis('')} className="px-6 py-3 bg-slate-100 rounded-lg">Clear</button>
            </div>
          </form>

          {analysis && <pre className="whitespace-pre-wrap mt-6 bg-slate-50 p-4 rounded-md border border-slate-200 text-sm text-slate-800">{analysis}</pre>}
        </div>
      </div>
    </div>
  );
}

