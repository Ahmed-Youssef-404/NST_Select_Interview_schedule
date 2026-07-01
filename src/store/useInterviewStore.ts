import { create } from 'zustand';
import type { Slot, UserStatus } from '@/types';

interface PendingUser {
    name: string;
    email: string;
    userId: string;
}

interface InterviewState {
    user: UserStatus | null;
    slots: Slot[];
    pendingUsers: PendingUser[]; // لستة الطلاب الذين لم يحجزوا مسبقاً
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    checkUserAuth: (email: string, userId: string) => Promise<UserStatus>;
    checkAdminAuth: (password: string) => Promise<boolean>;
    fetchSlots: () => Promise<void>;
    bookInterviewSlot: (slotId: string) => Promise<{ success: boolean; message?: string }>;

    // Admin Actions
    addCustomSlot: (day: string, timeRange: string) => Promise<boolean>;
    deleteCustomSlot: (slotId: string) => Promise<boolean>;

    logout: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
    user: null,
    slots: [],
    pendingUsers: [],
    isAdmin: false,
    isLoading: false,
    error: null,

    // 1. تسجيل دخول الطالب والتحقق من وجوده في شيت الطلاب
    checkUserAuth: async (email: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/slots?action=checkUser&email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`);
            const data: UserStatus = await res.json();

            if (data.exists) {
                set({ user: data, isAdmin: false, isLoading: false });
            } else {
                set({ error: 'This credentials are not registered in our database.', isLoading: false });
            }
            return data;
        } catch (err) {
            set({ error: 'Connection error with Vercel serverless function.', isLoading: false });
            return { exists: false };
        }
    },

    // 2. تسجيل دخول الـ Admin عبر الباسورد المشفر في Vercel Env
    checkAdminAuth: async (password: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch('/api/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'adminLogin', password })
            });
            const data = await res.json();

            if (data.success) {
                set({ isAdmin: true, user: null, isLoading: false });
                return true;
            } else {
                set({ error: 'Incorrect Admin Access Password.', isLoading: false });
                return false;
            }
        } catch (err) {
            set({ error: 'Failed to authorize admin credentials.', isLoading: false });
            return false;
        }
    },

    // 3. جلب جميع المواعيد والـ Pending للطلاب (تحديث تلقائي)
    fetchSlots: async () => {
        try {
            const res = await fetch('/api/slots?action=getSlots');
            const data = await res.json();
            if (data.slots) {
                set({
                    slots: data.slots,
                    pendingUsers: data.pendingUsers || []
                });
            }
        } catch (err) {
            console.error('Error syncing store data from api:', err);
        }
    },

    // 4. حجز الطالب لميعاد متاح
    bookInterviewSlot: async (slotId: string) => {
        const currentUser = get().user;
        if (!currentUser?.userId) return { success: false, message: 'Session expired or unknown user.' };

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
                set((state) => ({
                    user: state.user ? { ...state.user, hasBooked: true, bookedSlotId: slotId } : null,
                    isLoading: false
                }));
                await get().fetchSlots(); // ريفريش لحظي للداتا
                return { success: true };
            } else {
                set({ isLoading: false });
                await get().fetchSlots();
                return { success: false, message: data.message };
            }
        } catch (err) {
            set({ isLoading: false });
            return { success: false, message: 'Network bottleneck or sheet connection timed out.' };
        }
    },

    // 5. أدمن: توليد ميعاد جديد بناءً على الـ Dropdowns
    addCustomSlot: async (day: string, timeRange: string) => {
        try {
            const res = await fetch('/api/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'addSlot', day, timeRange })
            });
            const data = await res.json();
            if (data.success) {
                await get().fetchSlots();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to dispatch addSlot action:', err);
            return false;
        }
    },

    // 6. أدمن: مسح ميعاد نهائياً من الجدول والشيت
    deleteCustomSlot: async (slotId: string) => {
        try {
            const res = await fetch('/api/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'deleteSlot', slotId })
            });
            const data = await res.json();
            if (data.success) {
                await get().fetchSlots();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to dispatch deleteSlot action:', err);
            return false;
        }
    },

    // 7. تسجيل الخروج وتصفير الجلسة تماماً
    logout: () => set({ user: null, isAdmin: false, error: null, slots: [], pendingUsers: [] })
}));