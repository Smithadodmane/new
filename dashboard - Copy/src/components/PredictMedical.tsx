import { useState } from 'react';
import { ArrowLeft, Stethoscope } from 'lucide-react';

interface PredictMedicalProps {
  onNavigate: (page: string) => void;
}

export default function PredictMedical({ onNavigate }: PredictMedicalProps) {
  const [formData, setFormData] = useState({
    symptoms: '',
    duration: '',
    frequency: '',
    medicalHistory: '',
    currentMedications: '',
    dietaryRestrictions: ''
  });

  const [result, setResult] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const analysis = `Medical Assessment Summary:

Symptoms Reported: ${formData.symptoms}
Duration: ${formData.duration}
Frequency: ${formData.frequency}
Medical History: ${formData.medicalHistory || 'Not specified'}
Current Medications: ${formData.currentMedications || 'None reported'}
Dietary Restrictions: ${formData.dietaryRestrictions || 'None reported'}

Preliminary Insights:
• Based on your symptoms, consider consulting with a healthcare provider
• Track symptom patterns in relation to specific foods
• Keep a detailed log for your medical appointments
• Consider allergy testing if symptoms are consistent

IMPORTANT DISCLAIMER:
This is NOT a medical diagnosis. Please consult with qualified healthcare professionals for:
- Persistent or severe symptoms
- Sudden changes in health
- Any concerns about food allergies or intolerances
- Personalized medical advice

Recommended Actions:
1. Schedule an appointment with your primary care physician
2. Continue logging food intake and symptoms
3. Share this information with your healthcare provider
4. Consider consulting an allergist or nutritionist`;

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
          <h1 className="text-4xl font-bold text-slate-800 mb-8">Predict Medical</h1>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Medical Insights</h2>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm text-yellow-800 font-medium">
                This tool provides general information only. Always consult healthcare professionals for medical advice.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Symptoms
                </label>
                <textarea
                  required
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="Describe your symptoms in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Duration of Symptoms
                </label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="e.g., 2 weeks, 3 days, several months..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Frequency of Occurrence
                </label>
                <input
                  type="text"
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="e.g., Daily, 2-3 times per week, after meals..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Relevant Medical History
                </label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="Previous diagnoses, allergies, family history..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Medications
                </label>
                <input
                  type="text"
                  value={formData.currentMedications}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentMedications: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="List any medications you're currently taking..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Dietary Restrictions or Known Allergies
                </label>
                <input
                  type="text"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="e.g., Lactose intolerant, nut allergy..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
              >
                Generate Medical Insights
              </button>
            </form>

            {result && (
              <div className="mt-8 p-6 bg-cyan-50 border-l-4 border-cyan-500 rounded-lg">
                <h3 className="font-bold text-slate-800 mb-3 text-lg">Medical Assessment</h3>
                <pre className="text-slate-700 whitespace-pre-wrap font-sans">{result}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
