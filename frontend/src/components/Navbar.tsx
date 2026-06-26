'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PAGES = [
  { href: '/', label: 'Overview', icon: '◉' },
  { href: '/forecast', label: '7-Day Forecast', icon: '📅' },
  { href: '/simulation', label: 'What-If', icon: '🔮' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 text-white h-full w-56 flex-shrink-0 p-4 space-y-1 flex flex-col">
      <Link href="/" className="text-lg font-bold mb-6 px-3 py-2 border-b border-slate-700 block hover:opacity-80 transition-opacity">
        <span className="text-cyan-400">☀</span> Climate Twin
      </Link>
      {PAGES.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left ${
              active
                ? 'bg-cyan-600/20 text-cyan-300 ring-1 ring-cyan-500/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
      <div className="mt-auto pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-600 px-3">Andhra Pradesh<br />AI Digital Twin</p>
      </div>
    </nav>
  );
}
