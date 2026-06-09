import { Link, useLocation } from 'react-router-dom';
import { Sparkles, BarChart2, Moon, Sun, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xl font-black font-display tracking-tight text-gradient">
              Intelligence
            </span>
          </Link>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link 
              to="/" 
              className={`p-2 rounded-lg flex items-center transition-all ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'}`}
            >
              <Search size={18} className="md:mr-2" />
              <span className="hidden md:inline text-sm">Search</span>
            </Link>
            
            <Link 
              to="/analytics" 
              className={`p-2 rounded-lg flex items-center transition-all ${location.pathname === '/analytics' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'}`}
            >
              <BarChart2 size={18} className="md:mr-2" />
              <span className="hidden md:inline text-sm">Analytics</span>
            </Link>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
            
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
