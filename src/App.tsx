import React from 'react';
import { useInterviewStore } from './store/useInterviewStore';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AdminConsole } from './components/AdminConsole';

const App: React.FC = () => {
  const { user, isAdmin } = useInterviewStore();

  return (
    <div className="min-h-screen bg-[#050505]" dir="ltr">
      {isAdmin ? (
        <AdminConsole />
      ) : user ? (
        <Dashboard />
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;