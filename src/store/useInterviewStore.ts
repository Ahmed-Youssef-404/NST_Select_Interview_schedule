import { create } from 'zustand';
import type { Slot, UserStatus } from '@/types';

interface InterviewState {
    user: UserStatus | null;
    slots: Slot[];
    isAdmin: boolean; // هل المستخدم الحالي أدمن؟
    isLoading: boolean;
    error: string | null;

    // Actions
    checkUserAuth: (email: string, userId: string) => Promise<UserStatus>;
    checkAdminAuth: (password: string) => Promise<boolean>; // دخول الأدمن
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
    isAdmin: false,
    isLoading: false,
    error: null,

    checkUserAuth: async (email: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/slots?action=checkUser&email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`);
            const data: UserStatus = await res.json();
            if (data.exists) {
                set({ user: data, isAdmin: false, isLoading: false });
            } else {
                set({ error: 'Invalid credentials or not registered.', isLoading: false });
            }
            return data;
        } catch (err) {
            set({ error: 'Server connection error.', isLoading: false });
            return { exists: false };
        }
    },

    // تشيك الأدمن
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
                set({ error: 'Incorrect Admin Password.', isLoading: false });
                return false;
            }
        } catch (err) {
            set({ error: 'Server connection error.', isLoading: false });
            return false;
        }
    },

    fetchSlots: async () => {
        try {
            const res = await fetch('/api/slots?action=getSlots');
            const data = await res.json();
            if (data.slots) set({ slots: data.slots });
        } catch (err) {
            console.error('Error fetching slots:', err);
        }
    },

    bookInterviewSlot: async (slotId: string) => {
        const currentUser = get().user;
        if (!currentUser?.userId) return { success: false, message: 'Unknown user.' };
        set({ isLoading: true });
        try {
            const res = await fetch('/api/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bookSlot', slotId, userId: currentUser.userId, email: currentUser.email })
            });
            const data = await res.json();
            if (data.success) {
                set((state) => ({
                    user: state.user ? { ...state.user, hasBooked: true, bookedSlotId: slotId } : null,
                    isLoading: false
                }));
                await get().fetchSlots();
                return { success: true };
            } else {
                set({ isLoading: false });
                await get().fetchSlots();
                return { success: false, message: data.message };
            }
        } catch (err) {
            set({ isLoading: false });
            return { success: false, message: 'Connection error.' };
        }
    },

    // أدمن: إضافة ميعاد
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
            return false;
        }
    },

    // أدمن: حذف ميعاد
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
            return false;
        }
    },

    logout: () => set({ user: null, isAdmin: false, error: null })
}));