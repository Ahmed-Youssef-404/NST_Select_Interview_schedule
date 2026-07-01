import React, { useEffect, useState } from 'react';
import { useInterviewStore } from '../store/useInterviewStore';
import type { Slot } from '@/types';

export const Dashboard: React.FC = () => {
    const { user, slots, fetchSlots, bookInterviewSlot, isLoading, logout } = useInterviewStore();
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null); // للـ Confirmation Popup
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Polling كل 10 ثوانٍ
    useEffect(() => {
        fetchSlots();
        const interval = setInterval(() => {
            fetchSlots();
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchSlots]);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 5000);
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlotId) return;
        const slotId = selectedSlotId;
        setSelectedSlotId(null); // اقفل الـ Popup فورا

        const result = await bookInterviewSlot(slotId);
        if (result.success) {
            showToast('success', 'Your interview slot has been booked successfully!');
        } else {
            showToast('error', result.message || 'Something went wrong. Please try another slot.');
        }
    };

    const groupSlotsByDay = (slotsList: Slot[]) => {
        return slotsList.reduce((acc, slot) => {
            if (!acc[slot.day]) acc[slot.day] = [];
            acc[slot.day].push(slot);
            return acc;
        }, {} as Record<string, Slot[]>);
    };

    const groupedSlots = groupSlotsByDay(slots);

    const isSlotFull = (slot: Slot) => {
        let count = 0;
        if (slot.user1) count++;
        if (slot.user2) count++;
        if (slot.user3) count++;
        return slot.status === 'Full' || count >= 3;
    };

    // شاشة المستخدم بعد الحجز الناجح مسبقاً
    if (user?.hasBooked) {
        const mySlot = slots.find(s => s.slotId === user.bookedSlotId);
        return (
            <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-[#161B26] border border-[#242C3D] p-8 rounded-2xl text-center shadow-2xl">
                    <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Congratulations, {user.name}! 🎉</h1>
                    <p className="text-gray-400 mb-8">Your interview schedule is confirmed. We are excited to meet you!</p>

                    {mySlot ? (
                        <div className="bg-[#0B0F19] border border-[#242C3D] p-6 rounded-xl inline-block min-w-[300px] mb-8">
                            <div className="text-blue-400 font-semibold mb-2">{mySlot.day}</div>
                            <div className="text-2xl font-bold text-white tracking-wider font-mono">{mySlot.timeRange}</div>
                        </div>
                    ) : (
                        <p className="text-yellow-500 mb-8 text-sm">Loading your slot details...</p>
                    )}

                    <p className="text-xs text-gray-500 block mb-6">Note: Slots cannot be changed once booked. Contact management for inquiries.</p>
                    <button onClick={logout} className="px-5 py-2.5 bg-[#242C3D] hover:bg-gray-700 rounded-xl text-sm transition-colors">Sign Out</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-6 md:p-12 relative">

            {/* Dynamic Toast System */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border text-sm max-w-md backdrop-blur-md transition-all duration-300 ${toast.type === 'success' ? 'bg-green-950/90 border-green-500 text-green-300' : 'bg-red-950/90 border-red-500 text-red-300'
                    }`}>
                    {toast.msg}
                </div>
            )}

            {/* Confirmation Custom Popup (Modal) */}
            {selectedSlotId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#161B26] border border-[#242C3D] p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Confirm Your Selection</h3>
                        <p className="text-sm text-gray-400 mb-6">Are you sure you want to pick this slot? This action cannot be undone later.</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setSelectedSlotId(null)}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto">

                {/* Welcome Message Section */}
                <div className="bg-gradient-to-r from-[#161B26] to-[#1e2536] border border-[#242C3D] p-8 rounded-2xl mb-10 relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">Admission Update</span>
                        <h1 className="text-3xl font-extrabold text-white mt-4 mb-2">Congratulations, {user?.name}! 🎉</h1>
                        <p className="text-gray-300 max-w-2xl leading-relaxed text-sm">
                            We are absolutely thrilled to inform you that you have been accepted to move forward with the Northern Stars Team! Your profile truly stood out to us.
                            Please take a moment to select your preferred interview time slot from the available options below so we can get to know you better.
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-1/4 translate-x-1/4">
                        <svg className="w-96 h-96 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </div>
                </div>

                {/* Dashboard Actions Bar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-md font-semibold tracking-wide uppercase text-gray-400">Available Interview Slots</h2>
                    <button onClick={logout} className="px-4 py-2 bg-[#161B26] hover:bg-[#242C3D] border border-[#242C3D] rounded-xl text-xs font-medium transition-colors">Sign Out</button>
                </div>

                {/* Slots Grid Setup */}
                <div className="space-y-8">
                    {Object.keys(groupedSlots).length === 0 ? (
                        <div className="text-center text-gray-500 py-12">Loading schedule details...</div>
                    ) : (
                        Object.entries(groupedSlots).map(([day, daySlots]) => (
                            <div key={day} className="bg-[#161B26]/30 border border-[#242C3D]/40 p-6 rounded-2xl">
                                <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    {day}
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {daySlots.map((slot) => {
                                        const isFull = isSlotFull(slot);

                                        return (
                                            <div
                                                key={slot.slotId}
                                                className={`border rounded-xl p-4 flex items-center justify-between transition-all duration-200 bg-[#161B26] ${isFull ? 'border-gray-900 opacity-40' : 'border-[#242C3D]'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="text-sm font-mono font-bold text-white">{slot.timeRange}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5">{isFull ? 'Fully Booked' : 'Available'}</div>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedSlotId(slot.slotId)}
                                                    disabled={isFull || isLoading}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isFull
                                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                                                        : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-blue-800'
                                                        }`}
                                                >
                                                    {isFull ? 'Full' : 'Select'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};