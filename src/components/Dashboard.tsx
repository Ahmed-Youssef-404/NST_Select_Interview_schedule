// src/components/Dashboard.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useInterviewStore } from '../store/useInterviewStore';
import type { Slot } from '@/types';
import StarsBackground from '@/components/StarsBackground';

export const Dashboard: React.FC = () => {
    const { user, slots, fetchSlots, bookInterviewSlot, isLoading, logout } = useInterviewStore();
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchSlots();
        const interval = setInterval(() => {
            fetchSlots();
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchSlots]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isSubmitting) {
            setSelectedSlotId(null);
        }
    };

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 5000);
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlotId) return;
        setIsSubmitting(true);

        const result = await bookInterviewSlot(selectedSlotId);

        setIsSubmitting(false);
        setSelectedSlotId(null);

        if (result.success) {
            showToast('success', 'Your interview slot has been booked successfully!');
        } else {
            showToast('error', result.message || 'Something went wrong. Please try another slot.');
        }
    };

    const getShortName = (fullName: string | undefined) => {
        if (!fullName) return '';
        const words = fullName.trim().split(/\s+/);
        return words.slice(0, 2).join(' ');
    };

    const shortName = getShortName(user?.name);

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

    // 1. شاشة المستخدم بعد الحجز الناجح مسبقاً (Gold/Black UI)
    if (user?.hasBooked) {
        const mySlot = slots.find(s => s.slotId === user.bookedSlotId);
        return (
            <div className="min-h-screen bg-[#050505] text-zinc-100 flex items-center justify-center p-4">
                <StarsBackground />
                <div className="w-full max-w-2xl bg-[#121212] border border-amber-500/20 p-8 rounded-2xl text-center shadow-2xl shadow-amber-500/5">
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 font-sans">Congratulations, {shortName}! 🎉</h1>
                    <p className="text-amber-500 font-medium text-sm mb-4">Your interview schedule is confirmed. We are excited to meet you!</p>

                    <div className="bg-[#1a1a1a] border border-zinc-800 p-5 rounded-xl block max-w-sm mx-auto mb-6 text-sm text-zinc-400">
                        💡 The meeting will be held <span className="text-white font-semibold">online via Discord</span>. The invitation link will be sent to you right before your interview time.
                    </div>

                    {mySlot ? (
                        <div className="bg-[#050505] border border-amber-500/30 p-6 rounded-xl inline-block min-w-[300px] mb-8 shadow-inner">
                            <div className="text-amber-500 font-semibold text-sm mb-2 uppercase tracking-wider">{mySlot.day}</div>
                            <div className="text-2xl font-bold text-white tracking-wider font-mono">{mySlot.timeRange}</div>
                        </div>
                    ) : (
                        <p className="text-amber-600 mb-8 text-sm">Loading your slot details...</p>
                    )}

                    <button onClick={logout} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm transition-all duration-200 cursor-pointer block mx-auto border border-zinc-700">Sign Out</button>
                </div>
            </div>
        );
    }

    // 2. الشاشة الأساسية لاختيار المواعيد (Gold/Black UI)
    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 p-6 md:p-12 relative">
            <StarsBackground />
            {/* Dynamic Toast System */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border text-sm max-w-md backdrop-blur-md transition-all duration-300 ${toast.type === 'success' ? 'bg-zinc-900 border-amber-500 text-amber-400' : 'bg-red-950/90 border-red-500 text-red-300'
                    }`}>
                    {toast.msg}
                </div>
            )}

            {/* Confirmation Custom Popup (Modal) */}
            {selectedSlotId && (
                <div
                    onClick={handleOverlayClick}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in cursor-default"
                >
                    <div
                        ref={modalRef}
                        className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl relative"
                    >
                        {isSubmitting ? (
                            <div className="py-6 flex flex-col items-center justify-center gap-4">
                                <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-sm text-zinc-300 font-medium">Securing your slot, please wait...</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-white mb-2">Confirm Your Selection</h3>
                                <p className="text-sm text-zinc-400 mb-6">Are you sure you want to pick this slot? This action cannot be undone later.</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setSelectedSlotId(null)}
                                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-zinc-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmBooking}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-lg shadow-amber-500/10"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto">

                {/* Shortened Welcome Message Section with Discord Note */}
                <div className="bg-gradient-to-r from-[#121212] to-[#1a1a1a] border border-amber-500/20 p-6 rounded-2xl mb-10 shadow-xl relative overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">NST Admission</span>
                    <h1 className="text-2xl font-extrabold text-white mt-3 mb-1">Congratulations, {shortName}! 🎉</h1>
                    <p className="text-zinc-300 leading-relaxed text-sm mb-3">
                        We are happy to have you with us and wish you the best of luck! Please select your interview time slot now.
                    </p>
                    <p className="text-xs text-amber-500/90 font-medium bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl inline-block">
                        📢 <span className="font-bold">Note:</span> The meeting will be held <span className="text-white font-semibold">online via Discord</span>. The link will be sent to you before your scheduled time.
                    </p>
                </div>

                {/* Dashboard Actions Bar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xs font-semibold tracking-wide uppercase text-zinc-400">Available Slots</h2>
                    <button onClick={logout} className="px-4 py-2 bg-[#121212] hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer text-zinc-300">Sign Out</button>
                </div>

                {/* Slots Grid Setup */}
                <div className="space-y-8">
                    {Object.keys(groupedSlots).length === 0 ? (
                        <div className="text-center text-zinc-500 py-12">Loading schedule details...</div>
                    ) : (
                        Object.entries(groupedSlots).map(([day, daySlots]) => (
                            <div key={day} className="bg-[#121212]/40 border border-zinc-900 p-6 rounded-2xl">
                                <h3 className="text-sm font-bold text-amber-500 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    {day}
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {daySlots.map((slot) => {
                                        const isFull = isSlotFull(slot);

                                        return (
                                            <div
                                                key={slot.slotId}
                                                className={`border rounded-xl p-4 flex items-center justify-between transition-all duration-200 bg-[#121212] ${isFull ? 'border-zinc-900/50 opacity-30' : 'border-zinc-800 hover:border-zinc-700'
                                                    }`}
                                            >
                                                <div>
                                                    <div className="text-sm font-mono font-bold text-white">{slot.timeRange}</div>
                                                    <div className={`text-[10px] mt-0.5 ${isFull ? 'text-zinc-600' : 'text-amber-500/70'}`}>
                                                        {isFull ? 'Fully Booked' : 'Available'}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => !isFull && setSelectedSlotId(slot.slotId)}
                                                    disabled={isFull || isLoading}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isFull
                                                        ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                                        : 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95 disabled:opacity-60 cursor-pointer shadow-md shadow-amber-500/5'
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