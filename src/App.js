import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import FormatManager from './components/FormatManager';
import Nav from './components/Nav';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Nav />
        <div className="container mx-auto">
          <Routes>
            <Route path="/" element={<UserDashboard />} />
            <Route path="/format-settings" element={<FormatManager />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;