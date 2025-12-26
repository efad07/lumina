import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Bell, Shield, User, Settings as SettingsIcon } from 'lucide-react';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        {/* Appearance Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-orange-500" />}
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Adjust the appearance of Lumina to reduce eye strain.</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={theme === 'dark'}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Mock Sections for completeness */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" /> Account
          </h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account information and email preferences.</p>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-400" /> Notifications
          </h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">Choose what updates you want to receive.</p>
        </div>

        <div className="p-6">
           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-400" /> Privacy & Security
          </h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">Control your profile visibility and security settings.</p>
        </div>
      </div>
    </div>
  );
};