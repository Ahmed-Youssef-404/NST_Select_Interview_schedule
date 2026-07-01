import React, { useState } from 'react';
import { useInterviewStore } from '../store/useInterviewStore';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const { checkUserAuth, isLoading, error } = useInterviewStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !userId.trim()) return;
        await checkUserAuth(email.trim(), userId.trim());
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-gray-100 px-4">
            <div className="w-full max-w-md bg-[#161B26] border border-[#242C3D] p-8 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Northern Stars Team</h2>
                    <p className="text-sm text-gray-400">سجل دخول لحجز موعد المقابلة الشخصية (Interview)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-space-y-5 flex flex-col gap-5">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-4 py-3 bg-[#0B0F19] border border-[#242C3D] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-right"
                            dir="ltr"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">الكود الخاص بك (User ID)</label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="NST-XXXX"
                            className="w-full px-4 py-3 bg-[#0B0F19] border border-[#242C3D] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-center"
                            dir="ltr"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-sm text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium rounded-xl transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-blue-600/20"
                    >
                        {isLoading ? 'جاري التحقق...' : 'دخول'}
                    </button>
                </form>
            </div>
        </div>
    );
};