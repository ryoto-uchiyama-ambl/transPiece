"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import "remixicon/fonts/remixicon.css";

export default function CollapsibleSidebar() {
    const [open, setOpen] = useState(true);
    const pathname = usePathname();

    const links = [
        { href: "/", icon: "ri-home-2-fill", label: "Home" },
        { href: "/book", icon: "ri-book-2-line", label: "Book" },
        { href: "/gutenberg/gutenbergSearch", icon: "ri-search-line", label: "BookSearch" },
        { href: "/chart", icon: "ri-bar-chart-line", label: "Chart" },
        { href: "/message", icon: "ri-message-3-line", label: "Message" },
        { href: "/user", icon: "ri-user-line", label: "User" },
        { href: "/settings", icon: "ri-settings-3-line", label: "Settings" },
    ];

    return (
        <aside className={`${open ? 'w-64' : 'w-10'} bg-blue-800 text-white h-screen transition-all duration-300`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full p-3 focus:outline-none"
            >
                {open
                    ? <span className="ri-arrow-left-circle-line"></span>
                    : <span className="ri-arrow-right-circle-line"></span>}
            </button>
            <nav className="mt-6 space-y-2">
                {links.map(({ href, icon, label }) => {
                    const isActive = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <a
                            key={href}
                            href={href}
                            className={`flex items-center space-x-2 rounded py-2 hover:bg-blue-700 ${
                                isActive ? 'bg-blue-900 px-5' : 'px-3'
                            }`}
                        >
                            <span className={icon}></span>
                            {open && <span>{label}</span>}
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
}
