"use client";

import { useState } from 'react';

export default function CollapsibleSidebar() {
    const [open, setOpen] = useState(true);
    return (
        <aside className={`${open ? 'w-64' : 'w-16'} bg-blue-800 text-white h-screen transition-all duration-300`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full p-4 focus:outline-none"
            >
                {open ? '<' : '>'}
            </button>
            <nav className="mt-6 space-y-2">
                <a href="#" className="flex items-center space-x-2 hover:bg-blue-700 rounded px-3 py-2">
                    <span>🏠</span>
                    {open && <span>Dashboard</span>}
                </a>
            </nav>
        </aside>
    );
}
