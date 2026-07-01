import React, { useState } from 'react';
import { useInterviewStore } from '../store/useInterviewStore';

export const Login: React.FC = () => {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const { checkUserAuth, checkAdminAuth, isLoading, error } = useInterviewStore();

    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !userId.trim()) return;
        await checkUserAuth(email.trim(), userId.trim());
    };

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminPassword.trim()) return;
        await checkAdminAuth(adminPassword.trim());
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-zinc-100 px-4">
            <div className="w-full max-w-md bg-[#121212] border border-zinc-800 p-8 rounded-2xl shadow-2xl shadow-amber-500/5">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Northern Stars Team</h2>
                    <p className="text-sm text-amber-500/80 font-medium">
                        {isAdminMode ? 'Admin Management Portal' : 'Sign in to book your interview slot'}
                    </p>
                </div>

                {isAdminMode ? (
                    /* Admin Form */
                    <form onSubmit={handleAdminSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Admin Security Password</label>
                            <input
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-[#050505] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors text-center font-mono"
                                required
                            />
                        </div>
                        {error && <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 text-center">{error}</div>}
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-all disabled:cursor-not-allowed cursor-pointer">
                            {isLoading ? 'Verifying Admin...' : 'Access Console'}
                        </button>
                    </form>
                ) : (
                    /* Student Form */
                    <form onSubmit={handleStudentSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 bg-[#050505] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">User ID (Registration Code)</label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="NST-XXXX"
                                className="w-full px-4 py-3 bg-[#050505] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors text-center font-mono"
                                required
                            />
                        </div>
                        {error && <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 text-center">{error}</div>}
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-all disabled:cursor-not-allowed cursor-pointer">
                            {isLoading ? 'Verifying...' : 'Sign In'}
                        </button>
                    </form>
                )}
            </div>

            {/* الرابط الخفي والممتاز لتبديل الأوضاع في الأسفل */}
            <button
                onClick={() => { setIsAdminMode(!isAdminMode); useInterviewStore.setState({ error: null }); }}
                className="mt-6 text-xs text-zinc-600 hover:text-amber-500/70 underline transition-colors cursor-pointer"
            >
                {isAdminMode ? 'Back to Student Login' : 'Are you an Admin? Switch here'}
            </button>
        </div>
    );
};