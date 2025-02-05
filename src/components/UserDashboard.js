import React, { useState, useEffect } from 'react';
import { ArrowUpDown, RefreshCw, User } from 'lucide-react';

const formatWatchTime = (minutes) => {
  if (!minutes || minutes === 0) return 'No watch time recorded';
  
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
};

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({
    column: 'friendly_name',
    direction: 'asc'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [formatFields, setFormatFields] = useState([]);

  useEffect(() => {
    const fetchFormatSettings = async () => {
      try {
        const response = await fetch('/api/format-settings');
        const data = await response.json();
        setFormatFields(data.fields || []);
      } catch (error) {
        console.error('Error loading format settings:', error);
      }
    };
    fetchFormatSettings();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        order_column: sortConfig.column,
        order_dir: sortConfig.direction,
        search: search
      });
      
      const response = await fetch(`/api/users?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      if (data.response?.data) {
        setUsers(data.response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [sortConfig, search]);

  const handleSort = (column) => {
    setSortConfig(prevConfig => ({
      column,
      direction: prevConfig.column === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (column) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return (
      <ArrowUpDown 
        className={`h-4 w-4 ${sortConfig.direction === 'asc' ? 'text-blue-400' : 'text-blue-400 rotate-180'}`} 
      />
    );
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      const userData = data.response?.data;
      setSelectedUser(userData);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const columnDefs = [
    { id: 'friendly_name', label: 'Name', sortable: true },
    { id: 'last_seen', label: 'Last Seen', sortable: true },
    { id: 'total_plays', label: 'Plays', sortable: true },
    ...formatFields.map(field => ({
      id: field.id,
      label: field.id.charAt(0).toUpperCase() + field.id.slice(1),
      sortable: false
    }))
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between bg-gray-800 border border-gray-700 p-4 rounded-lg">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          <button 
            onClick={fetchUsers}
            className="p-2 rounded hover:bg-gray-700 text-gray-300"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {columnDefs.map(({ id, label: colLabel, sortable }) => (
                    <th key={id} className="p-4 text-left text-gray-300">
                      {sortable ? (
                        <button 
                          onClick={() => handleSort(id)}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          <span>{colLabel}</span>
                          {getSortIcon(id)}
                        </button>
                      ) : (
                        <span>{colLabel}</span>
                      )}
                    </th>
                  ))}
                  <th className="p-4 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5 + formatFields.length} className="text-center py-8 text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5 + formatFields.length} className="text-center py-8 text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.user_id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="p-4 text-gray-300">{user.friendly_name}</td>
                      <td className="p-4 text-gray-300">{user.last_seen_formatted}</td>
                      <td className="p-4 text-gray-300">{user.total_plays || 0}</td>
                      {formatFields.map(field => (
                        <td key={field.id} className="p-4 text-gray-300">{user[field.id]}</td>
                      ))}
                      <td className="p-4">
                        <button
                          onClick={() => fetchUserDetails(user.user_id)}
                          className="p-2 rounded hover:bg-gray-600 text-gray-300"
                          title="View Details"
                        >
                          <User className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-4">User Details</h3>
          {selectedUser ? (
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="font-medium">Name:</span> {selectedUser.friendly_name}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Email:</span> {selectedUser.email}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Status:</span> {selectedUser.is_active ? 'Active' : 'Inactive'}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Admin:</span> {selectedUser.is_admin ? 'Yes' : 'No'}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Total Time:</span> {formatWatchTime(selectedUser.total_time_watched)}
              </p>
            </div>
          ) : (
            <p className="text-gray-400">Select a user to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;