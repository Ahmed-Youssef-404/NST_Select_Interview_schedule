export interface Slot {
  slotId: string;
  day: string;
  timeRange: string;
  user1: string | null;
  user2: string | null;
  user3: string | null;
  status: 'Available' | 'Full';
}

export interface UserStatus {
  exists: boolean;
  name?: string;
  email?: string;
  userId?: string;
  hasBooked?: boolean;
  bookedSlotId?: string | null;
}

// الـ Type الجديد الخاص بصفحة الـ Admin لرؤية الطلاب ببياناتهم كاملة
export interface AdminSlotView extends Slot {
  user1Details?: { name: string; email: string } | null;
  user2Details?: { name: string; email: string } | null;
  user3Details?: { name: string; email: string } | null;
}