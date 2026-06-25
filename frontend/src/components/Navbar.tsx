'use client';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: '◉' },
  { id: 'forecast', label: '7-Day Forecast', icon: '◈' },
  { id: 'simulation', label: 'What-If', icon: '⚙' },
];

export default function Navbar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="bg-slate-900 text-white h-full w-56 flex-shrink-0 p-4 space-y-1 flex flex-col">
      <div className="text-lg font-bold mb-6 px-3 py-2 border-b border-slate-700">
        <span className="text-cyan-400">☀</span> Climate Twin
      </div>
      {SECTIONS.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full text-left"
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
      <div className="mt-auto pt-4 border-t border-slate-700">
        <p className="text-[10px] text-slate-600 px-3">Andhra Pradesh<br />AI Digital Twin</p>
      </div>
    </nav>
  );
}
