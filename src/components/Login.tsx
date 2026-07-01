import React, { useState } from 'react';
import { useInterviewStore } from '../store/useInterviewStore';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const { checkUserAuth, isLoading, error } = useInterviewStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !userId.trim()) return;
        await checkUserAuth(email.trim().toLowerCase(), userId.trim());
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-gray-100 px-4">
            <div className="w-full max-w-md bg-[#161B26] border border-[#242C3D] p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2 font-sans">Northern Stars Team</h2>
                    <p className="text-sm text-gray-400">Sign in to book your interview slot</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-4 py-3 bg-[#0B0F19] border border-[#242C3D] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">User ID (Registration Code)</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="NST-XXXX"
                            className="w-full px-4 py-3 bg-[#0B0F19] border border-[#242C3D] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-center font-mono"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-sm text-red-400 text-center">
                            Invalid credentials. Please try again.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:hover:bg-amber-500 disabled:opacity-30 text-black font-semibold rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-amber-500/5 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isLoading ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};