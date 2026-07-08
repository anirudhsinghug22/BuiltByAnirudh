'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon, FolderKanban, Layers } from 'lucide-react';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const isBuilder = pathname === '/builder';
  const isDashboard = pathname === '/dashboard';
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/80 bg-white/80 dark:bg-[#0E0C0B]/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img 
            src="/logo.png" 
            alt="BuiltByAnirudh Logo" 
            className="w-9 h-9 object-contain rounded-xl shadow-md shadow-[#009966]/15 group-hover:scale-105 transition-transform duration-200 bg-white p-0.5 border border-slate-200 dark:border-slate-850"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-lg leading-none tracking-tight text-[#151210] dark:text-[#F5F0EA]">
              BuiltByAnirudh
            </span>
            <span className="text-[10px] font-bold text-[#009966] tracking-wider uppercase mt-0.5">
              Requirement Engine
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-1 font-bold">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              isHome
                ? 'text-[#009966] bg-[#009966]/10'
                : 'text-[#151210] dark:text-[#F5F0EA] hover:text-[#009966] dark:hover:text-[#009966] hover:bg-[#009966]/5 dark:hover:bg-slate-800/40'
            }`}
          >
            Overview
          </Link>
          <Link
            href="/builder"
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
              isBuilder
                ? 'text-[#009966] bg-[#009966]/10'
                : 'text-[#151210] dark:text-[#F5F0EA] hover:text-[#009966] dark:hover:text-[#009966] hover:bg-[#009966]/5 dark:hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            Requirement Builder
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
              isDashboard
                ? 'text-[#009966] bg-[#009966]/10'
                : 'text-[#151210] dark:text-[#F5F0EA] hover:text-[#009966] dark:hover:text-[#009966] hover:bg-[#009966]/5 dark:hover:bg-slate-800/40'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Sales CRM Dashboard
          </Link>
        </nav>

        {/* Right buttons */}
        <div className="flex items-center gap-3">
          
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[#151210] dark:text-[#F5F0EA] hover:text-[#009966] dark:hover:text-[#009966] transition-all cursor-pointer animate-none"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 animate-pulse-slow" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Action CTA */}
          <Link
            href="/builder"
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#009966] hover:bg-[#008055] shadow-md shadow-[#009966]/15 hover:shadow-lg hover:shadow-[#009966]/25 active:scale-95 transition-all"
          >
            Start Estimation
          </Link>

        </div>
      </div>
    </header>
  );
}
