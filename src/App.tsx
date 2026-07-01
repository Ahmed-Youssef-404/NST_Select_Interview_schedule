import React from 'react';
import { useInterviewStore } from './store/useInterviewStore';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const { user } = useInterviewStore();

  // لو في يوزر متسجل (سواء حجز أو لسه) يدخل الـ Dashboard، غير كدة يفضل في الـ Login
  return (
    <div className="min-h-screen bg-[#0B0F19]" dir="rtl">
      {user ? <Dashboard /> : <Login />}
    </div>
  );
};

export default App;