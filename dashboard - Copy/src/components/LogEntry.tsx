import { useState } from 'react';
import { ArrowLeft, Upload, X, Calendar, Clock } from 'lucide-react';
import { FoodLog } from '../types';

interface LogEntryProps {
  onNavigate: (page: string) => void;
}

export default function LogEntry({ onNavigate }: LogEntryProps) {
  const [entries, setEntries] = useState<FoodLog[]>(() => {
    const saved = localStorage.getItem('foodLogs');
    return saved ? JSON.parse(saved) : [];
  });

  type FormData = {
    foodName: string;
    mealType: FoodLog['mealType'];
    consumedAt: string;
    notes: string;
    imageUrl: string;
  };

  const [formData, setFormData] = useState<FormData>({
    foodName: '',
    mealType: 'snack',
    consumedAt: new Date().toISOString().slice(0, 16),
    notes: '',
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [inputMode, setInputMode] = useState<'name' | 'image' | 'both'>('both');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev: FormData) => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // validation based on input mode
    if (inputMode === 'name' && !formData.foodName.trim()) {
      setError('Please enter a food name.');
      return;
    }
    if (inputMode === 'image' && !formData.imageUrl) {
      setError('Please upload an image.');
      return;
    }
    if (inputMode === 'both' && !formData.foodName.trim() && !formData.imageUrl) {
      setError('Please provide a food name or upload an image.');
      return;
    }
    setError('');
    const newEntry: FoodLog = {
      id: Date.now().toString(),
      foodName: formData.foodName || undefined,
      mealType: formData.mealType,
      consumedAt: formData.consumedAt,
      notes: formData.notes,
      imageUrl: formData.imageUrl || undefined
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('foodLogs', JSON.stringify(updatedEntries));

    setFormData({
      foodName: '',
      mealType: 'snack',
      consumedAt: new Date().toISOString().slice(0, 16),
      notes: '',
      imageUrl: ''
    });
    setImagePreview('');
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter((entry: FoodLog) => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('foodLogs', JSON.stringify(updatedEntries));
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

        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-800 mb-8">Log Entry</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">New Entry</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Input Mode</label>
                  <div className="inline-flex rounded-lg bg-slate-100 p-1">
                    <button type="button" onClick={() => setInputMode('name')}
                      className={`px-3 py-1 rounded-md ${inputMode === 'name' ? 'bg-white shadow' : 'text-slate-600'}`}>
                      Name
                    </button>
                    <button type="button" onClick={() => setInputMode('image')}
                      className={`px-3 py-1 rounded-md ${inputMode === 'image' ? 'bg-white shadow' : 'text-slate-600'}`}>
                      Image
                    </button>
                    <button type="button" onClick={() => setInputMode('both')}
                      className={`px-3 py-1 rounded-md ${inputMode === 'both' ? 'bg-white shadow' : 'text-slate-600'}`}>
                      Both
                    </button>
                  </div>
                </div>
                {inputMode !== 'image' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Food Name
                  </label>
                  <input
                    type="text"
                    value={formData.foodName}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, foodName: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={inputMode === 'name' ? 'What did you eat?' : 'What did you eat? (or leave blank and upload an image)'}
                  />
                </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Meal Type
                  </label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, mealType: e.target.value as FoodLog['mealType'] }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.consumedAt}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, consumedAt: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {inputMode !== 'name' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 cursor-pointer transition-all"
                    >
                      <Upload className="w-5 h-5 text-slate-600" />
                      <span className="text-slate-600">Choose Image</span>
                    </label>
                  </div>

                  {imagePreview && (
                    <div className="mt-4 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData((prev: FormData) => ({ ...prev, imageUrl: '' }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                )}

                {error && (
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                    placeholder="Any additional notes..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Save Entry
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Entries</h2>

              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {entries.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No entries yet. Add your first meal!</p>
                ) : (
                  entries.map((entry: FoodLog) => (
                    <div
                      key={entry.id}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{entry.foodName}</h3>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-1">
                            {entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1)}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {entry.imageUrl && (
                        <img
                          src={entry.imageUrl}
                          alt={entry.foodName}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}

                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(entry.consumedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(entry.consumedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      {entry.notes && (
                        <p className="text-slate-600 text-sm">{entry.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
