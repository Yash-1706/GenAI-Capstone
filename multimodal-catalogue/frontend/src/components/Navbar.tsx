import { Link, useLocation } from 'react-router-dom';
import { Leaf, BarChart2, Moon, Sun, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import BackendStatus from './BackendStatus';

function getInitialTheme() {
  return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export default function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((current) => {
      const next = !current;
      localStorage.theme = next ? 'dark' : 'light';
      return next;
    });
  };

  return (
    <nav className="glass sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-tr from-[#243d2d] to-[#b86b2f] p-2 rounded-xl group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-stone-300/60 dark:shadow-black/30">
              <Leaf className="text-[#f8f4ea]" size={20} />
            </div>
            <span className="text-xl font-black font-display tracking-tight text-gradient">
              Intelligence
            </span>
          </Link>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link 
              to="/" 
              className={`p-2 rounded-lg flex items-center transition-all duration-300 ${location.pathname === '/' ? 'bg-[#dbe7dc] text-[#243d2d] dark:bg-[#4f6f52]/25 dark:text-[#d79a5f] font-semibold shadow-sm' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 dark:text-stone-400'}`}
            >
              <Search size={18} className="md:mr-2" />
              <span className="hidden md:inline text-sm">Search</span>
            </Link>
            
            <Link 
              to="/analytics" 
              className={`p-2 rounded-lg flex items-center transition-all duration-300 ${location.pathname === '/analytics' ? 'bg-[#dbe7dc] text-[#243d2d] dark:bg-[#4f6f52]/25 dark:text-[#d79a5f] font-semibold shadow-sm' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 dark:text-stone-400'}`}
            >
              <BarChart2 size={18} className="md:mr-2" />
              <span className="hidden md:inline text-sm">Analytics</span>
            </Link>
            
            <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 mx-2"></div>

            <BackendStatus />

            <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 mx-2 hidden lg:block"></div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors duration-300"
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
