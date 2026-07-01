import React from 'react';
import { useInterviewStore } from './store/useInterviewStore';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const { user } = useInterviewStore();

  return (
    <div className="min-h-screen bg-[#0B0F19]" dir="ltr">
      {user ? <Dashboard /> : <Login />}
    </div>
  );
};

export default App;