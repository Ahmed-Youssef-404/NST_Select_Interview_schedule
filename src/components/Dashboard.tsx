import React, { useEffect, useState } from 'react';
import { useInterviewStore } from '../store/useInterviewStore';
import type { Slot } from '@/types';

export const Dashboard: React.FC = () => {
    const { user, slots, fetchSlots, bookInterviewSlot, isLoading, logout } = useInterviewStore();
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // 1. الـ Polling Logic لتحديث الـ UI لحظياً كل 10 ثوانٍ
    useEffect(() => {
        fetchSlots(); // أول رندرة
        const interval = setInterval(() => {
            fetchSlots();
        }, 10000); // 10 ثوانٍ
        return () => clearInterval(interval);
    }, [fetchSlots]);

    // هندلة عرض الـ Toast وتختفي بعد 4 ثوانٍ
    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleBooking = async (slotId: string) => {
        if (window.confirm('هل أنت متأكد من اختيار هذا الميعاد؟ لا يمكن تعديله لاحقاً.')) {
            setBookingId(slotId);
            const result = await bookInterviewSlot(slotId);
            setBookingId(null);

            if (result.success) {
                showToast('success', 'تم حجز موعدك بنجاح وتأكيده في الشيت!');
            } else {
                showToast('error', result.message || 'حدث خطأ ما.');
            }
        }
    };

    // عمل Grouping للمواعيد بناءً على اليوم
    const groupSlotsByDay = (slotsList: Slot[]) => {
        return slotsList.reduce((acc, slot) => {
            if (!acc[slot.day]) acc[slot.day] = [];
            acc[slot.day].push(slot);
            return acc;
        }, {} as Record<string, Slot[]>);
    };

    const groupedSlots = groupSlotsByDay(slots);

    // حساب الأماكن المتبقية في السلوت
    const getRemainingSeats = (slot: Slot) => {
        let count = 0;
        if (slot.user1) count++;
        if (slot.user2) count++;
        if (slot.user3) count++;
        return 3 - count;
    };

    // شاشة اليوزر لو هو حرك ميعاد أصلاً من قبل كدة
    if (user?.hasBooked) {
        const mySlot = slots.find(s => s.slotId === user.bookedSlotId);
        return (
            <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-[#161B26] border border-[#242C3D] p-8 rounded-2xl text-center shadow-2xl">
                    <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">أهلاً بك، {user.name}</h1>
                    <p className="text-gray-400 mb-8">لقد قمت بحجز موعد المقابلة الخاص بك مسبقاً بنجاح.</p>

                    {mySlot ? (
                        <div className="bg-[#0B0F19] border border-[#242C3D] p-6 rounded-xl inline-block min-w-[300px] mb-8">
                            <div className="text-blue-400 font-semibold mb-2">{mySlot.day}</div>
                            <div className="text-2xl font-bold text-white tracking-wider" dir="ltr">{mySlot.timeRange}</div>
                        </div>
                    ) : (
                        <p className="text-yellow-500 mb-8 text-sm">جاري تحميل تفاصيل ميعادك المختار...</p>
                    )}

                    <div className="text-xs text-gray-500 block mb-6">ملاحظة: لا يمكن تعديل الميعاد بعد الحجز. إذا واجهت مشكلة تواصل مع إدارة الفريق.</div>
                    <button onClick={logout} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">تسجيل الخروج</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-6 md:p-12 relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 left-6 z-50 px-6 py-4 rounded-xl shadow-2xl border text-sm max-w-md backdrop-blur-md animate-fade-in ${toast.type === 'success' ? 'bg-green-950/80 border-green-500 text-green-300' : 'bg-red-950/80 border-red-500 text-red-300'
                    }`}>
                    {toast.type === 'error' && '⚠️ '} {toast.msg}
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#242C3D] pb-6 mb-10 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">مرحباً، {user?.name}</h1>
                        <p className="text-sm text-gray-400">برجاء اختيار مواعيد الـ Interview المناسبة لك من الخيارات المتاحة أدناه.</p>
                    </div>
                    <button onClick={logout} className="px-4 py-2 bg-[#161B26] hover:bg-[#242C3D] border border-[#242C3D] rounded-xl text-sm transition-colors">تسجيل خروج</button>
                </div>

                {/* Mapped Days Grid */}
                <div className="space-y-12">
                    {Object.keys(groupedSlots).length === 0 ? (
                        <div className="text-center text-gray-500 py-12">جاري تحميل المواعيد المتاحة...</div>
                    ) : (
                        Object.entries(groupedSlots).map(([day, daySlots]) => (
                            <div key={day} className="bg-[#161B26]/40 border border-[#242C3D]/60 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    مواعيد يوم {day}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {daySlots.map((slot) => {
                                        const remaining = getRemainingSeats(slot);
                                        const isFull = slot.status === 'Full' || remaining === 0;
                                        const isCurrentBooking = bookingId === slot.slotId;

                                        return (
                                            <div
                                                key={slot.slotId}
                                                className={`border rounded-xl p-5 flex flex-col justify-between transition-all duration-200 bg-[#161B26] ${isFull
                                                    ? 'border-gray-800 opacity-40 pointer-events-none'
                                                    : 'border-[#242C3D] hover:border-gray-600 shadow-md shadow-black/10'
                                                    }`}
                                            >
                                                <div className="mb-4">
                                                    <div className="text-xs text-gray-400 mb-1">النطاق الزمني</div>
                                                    <div className="text-lg font-mono font-bold text-white" dir="ltr">{slot.timeRange}</div>
                                                </div>

                                                <div className="flex justify-between items-center mt-2">
                                                    <div>
                                                        {isFull ? (
                                                            <span className="text-xs px-2.5 py-1 bg-red-950/50 border border-red-900/50 text-red-400 rounded-full font-medium">مكتمل تماماً</span>
                                                        ) : (
                                                            <span className="text-xs px-2.5 py-1 bg-green-950/50 border border-green-900/50 text-green-400 rounded-full font-medium">
                                                                متاح ({remaining} أماكن متبقية)
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleBooking(slot.slotId)}
                                                        disabled={isFull || isLoading}
                                                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${isFull
                                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                            : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                                                            }`}
                                                    >
                                                        {isCurrentBooking ? 'جاري الحجز...' : 'اختيار الميعاد'}
                                                    </button>
                                                </div>
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