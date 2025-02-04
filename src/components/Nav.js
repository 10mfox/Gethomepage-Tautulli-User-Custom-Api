import React from 'react';
import { Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Nav = () => (
  <nav className="bg-gray-800 border-b border-gray-700">
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-400" />
          <span className="font-semibold text-lg text-white">Users</span>
        </Link>
        <Link 
          to="/format-settings"
          className="flex items-center space-x-2 text-gray-300 hover:text-white"
        >
          <Settings className="h-5 w-5 text-blue-400" />
          <span>Format Settings</span>
        </Link>
      </div>
    </div>
  </nav>
);

export default Nav;