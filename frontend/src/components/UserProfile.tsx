import React from 'react';

const UserProfile: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">User Profile</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">JD</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">John Doe</h3>
            <p className="text-gray-600 dark:text-gray-400">@johndoe:matrix.org</p>
            <p className="text-sm text-green-600 dark:text-green-400">Online</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User ID</h4>
            <p className="text-gray-900 dark:text-gray-100">@johndoe:matrix.org</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</h4>
            <p className="text-gray-900 dark:text-gray-100">John Doe</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Server</h4>
            <p className="text-gray-900 dark:text-gray-100">matrix.org</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</h4>
            <p className="text-green-600 dark:text-green-400">Active</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
            Edit Profile
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors duration-200">
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;