import { useState } from 'react';

interface LoginProps {
  onLogin: (user: { email: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter an email');
    if (!password) return setError('Please enter a password');

    // Mock auth: accept any credentials for now.
    const user = { email };
    try {
      if (remember) localStorage.setItem('safeBiteUser', JSON.stringify(user));
    } catch (e) {
      // ignore storage errors
    }
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col justify-center rounded-2xl overflow-hidden shadow-lg bg-gradient-to-b from-rose-50 to-rose-100 p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">SB</div>
              <div>
                <h3 className="text-2xl font-extrabold">Safe Bite</h3>
                <p className="text-sm text-slate-600">Track meals, symptoms and insights</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-slate-700">
            <h4 className="font-semibold mb-2">Why Safe Bite?</h4>
            <ul className="list-disc list-inside text-sm space-y-2">
              <li>Beautiful, privacy-first food log</li>
              <li>Pattern detection and suggestions</li>
              <li>Quick insights for better decisions</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">SB</div>
              <div>
                <h2 className="text-2xl font-bold">Welcome back</h2>
                <p className="text-sm text-slate-500">Sign in to access your Safe Bite dashboard</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-200 shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                placeholder="you@domain.com"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-200 shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                placeholder="••••••••"
              />
            </label>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} className="rounded" />
                <span className="text-slate-600">Remember me</span>
              </label>

              <a className="text-sm text-rose-600 hover:underline" href="#">Forgot?</a>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="grid grid-cols-1 gap-3">
              <button
                type="submit"
                className="w-full px-4 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition"
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('demo@safe.bite');
                  setPassword('demo');
                }}
                className="w-full px-4 py-3 border rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                Use demo credentials
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
