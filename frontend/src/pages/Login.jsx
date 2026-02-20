import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

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
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            {/* Background Accents */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#2563eb] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
                        <Zap size={32} strokeWidth={2.5} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
                        Welcome back to Flow<span className="text-[#2563eb]">ML</span>
                    </h1>
                    <p className="text-[14px] text-[#64748b] mt-2 font-medium">
                        Sign in to continue building ML pipelines
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-[32px] p-8 space-y-6 shadow-2xl">
                    {error && (
                        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-[12px] text-red-600 font-bold">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest block mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[#f1f5f9] text-sm text-[#0f172a] px-5 py-3 rounded-xl border border-black/5 focus:border-[#2563eb]/30 focus:ring-4 focus:ring-[#2563eb]/5 outline-none transition-all placeholder:text-[#94a3b8] font-medium"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest block mb-2">Security Key</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[#f1f5f9] text-sm text-[#0f172a] px-5 py-3 rounded-xl border border-black/5 focus:border-[#2563eb]/30 focus:ring-4 focus:ring-[#2563eb]/5 outline-none transition-all placeholder:text-[#94a3b8] font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-sm font-bold rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <p className="text-center text-[13px] text-[#64748b] font-medium">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#2563eb] hover:text-[#1d4ed8] font-bold transition-all underline underline-offset-4 decoration-current/30">
                            Create Workspace
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
