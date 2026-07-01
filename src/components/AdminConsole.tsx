// src/components/AdminConsole.tsx
import React, { useEffect, useState } from 'react';
import { useInterviewStore } from '../store/useInterviewStore';
import type { AdminSlotView } from '@/types';

export const AdminConsole: React.FC = () => {
    const { slots, fetchSlots, addCustomSlot, deleteCustomSlot, logout } = useInterviewStore();
    const [activeTab, setActiveTab] = useState<'view' | 'manage'>('view');

    // الـ States الجديدة للتحكم بالاختيارات
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchSlots();
        const interval = setInterval(() => fetchSlots(), 10000);
        return () => clearInterval(interval);
    }, [fetchSlots]);

    // دالة لتوليد المواعيد من 8 صباحاً لـ 10 مساءً بفارق نص ساعة
    const generateTimeSlots = () => {
        const times = [];
        let hour = 8;
        let minutes = 0;

        while (hour < 22 || (hour === 22 && minutes === 0)) {
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            const formattedHour = displayHour < 10 ? `0${displayHour}` : displayHour;
            const formattedMinutes = minutes === 0 ? '00' : minutes;

            times.push(`${formattedHour}:${formattedMinutes} ${ampm}`);

            minutes += 30;
            if (minutes === 60) {
                minutes = 0;
                hour++;
            }
        }
        return times;
    };

    const timeOptions = generateTimeSlots();

    // دالة لتحويل تاريخ الـ Input لشكل مقروء وموحد (مثل: Monday, July 6)
    const formatFriendlyDate = (dateString: string) => {
        if (!dateString) return '';
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) {
            alert('Please select both a date and a time slot.');
            return;
        }

        setIsActionLoading(true);

        // تحويل التاريخ لـ format موحد ومنظم لشيت البيانات
        const formattedDay = formatFriendlyDate(selectedDate);

        const success = await addCustomSlot(formattedDay, selectedTime);
        setIsActionLoading(false);

        if (success) {
            setSelectedTime('');
            alert('Time slot generated and saved successfully! 🎉');
        } else {
            alert('Failed to save slot. Please check your connection.');
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this slot?')) {
            await deleteCustomSlot(slotId);
        }
    };

    const adminSlots = slots as AdminSlotView[];

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">

                {/* Admin Header */}
                <div className="flex justify-between items-center border-b border-zinc-800 pb-6 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">NST Control Center</h1>
                        <p className="text-xs text-amber-500 font-medium">Administrator Dashboard Mode</p>
                    </div>
                    <button onClick={logout} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-semibold cursor-pointer text-zinc-300">
                        Exit Console
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="gap-2 mb-8 bg-[#121212] p-1 inline-flex rounded-xl border border-zinc-900">
                    <button
                        onClick={() => setActiveTab('view')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'view' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Registered Interviewees
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'manage' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Manage Time Slots
                    </button>
                </div>

                {/* TAB 1: VIEW SCHEDULES */}
                {activeTab === 'view' && (
                    <div className="space-y-6">
                        {adminSlots.length === 0 ? (
                            <p className="text-zinc-600 text-sm">No slots created yet.</p>
                        ) : (
                            adminSlots.map(slot => (
                                <div key={slot.slotId} className="bg-[#121212] border border-zinc-900 rounded-xl p-5">
                                    <div className="flex flex-col sm:flex-row justify-between border-b border-zinc-900 pb-3 mb-4 gap-2">
                                        <div>
                                            <span className="text-xs text-amber-500 font-bold">{slot.day}</span>
                                            <h4 className="text-lg font-mono font-bold text-white">{slot.timeRange}</h4>
                                        </div>
                                        <div className="text-xs text-zinc-500 self-start sm:self-center">
                                            Status: <span className={slot.status === 'Full' ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>{slot.status}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[slot.user1Details, slot.user2Details, slot.user3Details].map((user, index) => (
                                            <div key={index} className="bg-[#050505] p-3 rounded-lg border border-zinc-900 flex flex-col justify-center min-h-[64px]">
                                                {user ? (
                                                    <>
                                                        <div className="text-xs font-bold text-white mb-0.5">{user.name}</div>
                                                        <div className="text-[10px] text-zinc-500 font-mono">{user.email}</div>
                                                    </>
                                                ) : (
                                                    <div className="text-xs text-zinc-700 italic">Empty Seat</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* TAB 2: MANAGE SLOTS (AUTOMATED SELECTORS) */}
                {activeTab === 'manage' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Form Creator with Datepicker and Select fields */}
                        <div className="bg-[#121212] border border-zinc-900 p-6 rounded-xl h-fit">
                            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Generate New Slot</h3>
                            <form onSubmit={handleAddSlot} className="flex flex-col gap-5">

                                {/* 1. Date Picker Calendar */}
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wide">Select Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        className="w-full px-3 py-2.5 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-500 cursor-pointer scheme-dark"
                                        required
                                    />
                                    {selectedDate && (
                                        <span className="text-[10px] text-amber-500/70 mt-1 block">
                                            Will save as: {formatFriendlyDate(selectedDate)}
                                        </span>
                                    )}
                                </div>

                                {/* 2. Generated Time Dropdown */}
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wide">Select Interview Time</label>
                                    <select
                                        value={selectedTime}
                                        onChange={e => setSelectedTime(e.target.value)}
                                        className="w-full px-3 py-2.5 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
                                        required
                                    >
                                        <option value="" disabled>-- Choose Time Slot --</option>
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time} className="bg-[#121212]">{time}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 transition-colors shadow-md shadow-amber-500/5 mt-2"
                                >
                                    {isActionLoading ? 'Creating Slot...' : 'Generate & Deploy Slot'}
                                </button>
                            </form>
                        </div>

                        {/* List for Deletion */}
                        <div className="lg:col-span-2 space-y-3">
                            <h3 className="text-sm font-bold text-zinc-400 mb-4">Active System Slots</h3>
                            {slots.length === 0 ? (
                                <div className="text-zinc-600 text-xs py-4">No active interview slots found.</div>
                            ) : (
                                slots.map(slot => (
                                    <div key={slot.slotId} className="bg-[#121212] border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-zinc-500 block font-medium">{slot.day}</span>
                                            <span className="text-sm font-mono font-bold text-white">{slot.timeRange}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSlot(slot.slotId)}
                                            className="p-2 bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};