import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
            {/* Background Gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30">
                        <span className="text-2xl font-bold text-white">F</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        Welcome back to Flow<span className="text-indigo-600">ML</span>
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                        Sign in to continue building ML pipelines
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4 shadow-2xl">
                    {error && (
                        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] px-4 py-2.5 rounded-xl border border-[var(--border-color)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors placeholder:text-[var(--text-muted)]"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] px-4 py-2.5 rounded-xl border border-[var(--border-color)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors placeholder:text-[var(--text-muted)]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <p className="text-center text-xs text-[var(--text-muted)]">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
