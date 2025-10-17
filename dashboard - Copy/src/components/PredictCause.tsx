import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';

interface PredictCauseProps {
  onNavigate: (page: string) => void;
}

export default function PredictCause({ onNavigate }: PredictCauseProps) {
  const [formData, setFormData] = useState({
    symptom: '',
    severity: '5',
    duration: '',
    suspectedFoods: '',
    additionalInfo: ''
  });

  const [result, setResult] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const analysis = `Based on your input:
- Symptom: ${formData.symptom}
- Severity: ${formData.severity}/10
- Duration: ${formData.duration}
- Suspected Foods: ${formData.suspectedFoods}

Potential triggers identified:
• Common allergens found in mentioned foods
• Consider keeping a detailed food diary
• Recommend elimination diet to identify specific triggers
• Consult with a healthcare professional for personalized advice`;

    setResult(analysis);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-800 mb-8">Predict Cause</h1>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Identify Food Triggers</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Symptom Description
                </label>
                <input
                  type="text"
                  required
                  value={formData.symptom}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptom: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="e.g., Headache, stomach discomfort, fatigue..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Severity Level (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.severity}
                    onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-2xl font-bold text-orange-600 w-12 text-center">
                    {formData.severity}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="e.g., 2 hours, all day, 30 minutes..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Suspected Foods
                </label>
                <input
                  type="text"
                  required
                  value={formData.suspectedFoods}
                  onChange={(e) => setFormData(prev => ({ ...prev, suspectedFoods: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="List foods consumed before symptoms..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  placeholder="Any other relevant details..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                Analyze Potential Causes
              </button>
            </form>

            {result && (
              <div className="mt-8 p-6 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                <h3 className="font-bold text-slate-800 mb-3 text-lg">Analysis Results</h3>
                <pre className="text-slate-700 whitespace-pre-wrap font-sans">{result}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
