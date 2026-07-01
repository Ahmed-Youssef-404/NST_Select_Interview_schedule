import React from 'react';
import { useInterviewStore } from './store/useInterviewStore';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AdminConsole } from './components/AdminConsole';
import StarsBackground from '@/components/StarsBackground';

const App: React.FC = () => {
  const { user, isAdmin } = useInterviewStore();

  return (
    <div className="min-h-screen bg-[#050505]" dir="ltr">
      {isAdmin ? (
        <>
          <StarsBackground />
          <AdminConsole />
        </>
      ) : user ? (
        <Dashboard />
      ) : (
        <>
          <StarsBackground />
          <Login />
        </>
      )}
    </div>
  );
};

export default App;