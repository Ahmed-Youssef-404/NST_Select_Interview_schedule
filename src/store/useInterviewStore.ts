import type { Slot, UserStatus } from '@/types';
import { create } from 'zustand';

interface InterviewState {
    user: UserStatus | null;
    slots: Slot[];
    isLoading: boolean;
    error: string | null;

    // Actions
    checkUserAuth: (email: string, userId: string) => Promise<UserStatus>;
    fetchSlots: () => Promise<void>;
    bookInterviewSlot: (slotId: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
    user: null,
    slots: [],
    isLoading: false,
    error: null,

    // 1. التشيك على اليوزر أثناء الـ Login
    checkUserAuth: async (email: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/slots?action=checkUser&email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`);
            const data: UserStatus = await res.json();

            if (data.exists) {
                set({ user: data, isLoading: false });
            } else {
                set({ error: 'بيانات الدخول غير صحيحة أو غير مسجلة بقاعدة البيانات.', isLoading: false });
            }
            return data;
        } catch (err) {
            set({ error: 'حدث خطأ أثناء الاتصال بالسيرفر.', isLoading: false });
            return { exists: false };
        }
    },

    // 2. جلب المواعيد (وهنستخدمها كمان في الـ Polling)
    fetchSlots: async () => {
        // مش هنحط الـ isLoading بـ true هنا عشان الـ Polling ميعملش جليتش في الـ UI
        try {
            const res = await fetch('/api/slots?action=getSlots');
            const data = await res.json();
            if (data.slots) {
                set({ slots: data.slots });
            }
        } catch (err) {
            console.error('Error fetching slots:', err);
        }
    },

    // 3. حجز ميعاد (مع الـ Double Check والـ Race Condition Handling)
    bookInterviewSlot: async (slotId: string) => {
        const currentUser = get().user;
        if (!currentUser || !currentUser.userId || !currentUser.email) {
            return { success: false, message: 'مستخدم غير معروف.' };
        }

        set({ isLoading: true });
        try {
            const res = await fetch('/api/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'bookSlot',
                    slotId,
                    userId: currentUser.userId,
                    email: currentUser.email
                })
            });

            const data = await res.json();

            if (data.success) {
                // تحديث الـ User State محلياً عشان الـ UI يتنقل لصفحة "تم الحجز"
                set((state) => ({
                    user: state.user ? { ...state.user, hasBooked: true, bookedSlotId: slotId } : null,
                    isLoading: false
                }));
                // تحديث المواعيد فوراً
                await get().fetchSlots();
                return { success: true };
            } else {
                set({ isLoading: false });
                // لو السيرفر رفض (مثلاً الميعاد اتملى)، نحدث المواعيد فوراً عشان الـ UI يظهر الحقيقة
                await get().fetchSlots();
                return { success: false, message: data.message || 'عذراً، هذا الميعاد لم يعد متاحاً.' };
            }
        } catch (err) {
            set({ isLoading: false });
            return { success: false, message: 'فشلت عملية الاتصال بالسيرفر للحجز.' };
        }
    },

    logout: () => set({ user: null, error: null })
}));