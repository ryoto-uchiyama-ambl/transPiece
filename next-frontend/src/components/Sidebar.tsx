"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import "remixicon/fonts/remixicon.css";
import Link from 'next/link';

export default function CollapsibleSidebar() {
    const [open, setOpen] = useState(true);
    const pathname = usePathname();

    const links = [
        { href: "/home", icon: "ri-home-5-line", label: "Home" },
        { href: "/book", icon: "ri-book-open-line", label: "Book" },
        { href: "/gutenberg/gutenbergSearch", icon: "ri-search-2-line", label: "BookSearch" },
        { href: "/chart", icon: "ri-bar-chart-2-line", label: "Chart" },
        { href: "/message", icon: "ri-chat-3-line", label: "Message" },
        { href: "/user", icon: "ri-user-3-line", label: "User" },
        { href: "/settings", icon: "ri-settings-4-line", label: "Settings" },
    ];

    return (
        <aside
            className={`${open ? 'w-64' : 'w-16'} bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 h-screen transition-all duration-300 fixed left-0 top-0 shadow-xl z-50`}
        >
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className={`flex items-center ${open ? 'justify-between' : 'justify-center'} py-6 px-4 border-b border-gray-700/50`}>
                    {open && <h1 className="font-bold text-xl tracking-tight">Dashboard</h1>}
                    <button
                        onClick={() => setOpen(!open)}
                        className={`p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200 ${!open && 'mx-auto'}`}
                        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        <span className={`text-lg ${open ? 'ri-arrow-left-s-line' : 'ri-arrow-right-s-line'}`}></span>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 px-2 overflow-y-auto scrollbar-hide">
                    <ul className="space-y-1.5">
                        {links.map(({ href, icon, label }) => {
                            const isActive = pathname === href || pathname.startsWith(href);
                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className={`flex items-center ${open ? 'justify-start' : 'justify-center'} ${
                                            isActive 
                                                ? 'bg-indigo-600 text-white' 
                                                : 'text-gray-300 hover:bg-gray-700/40 hover:text-white'
                                        } rounded-lg px-3 py-2.5 transition-all duration-200 group`}
                                    >
                                        <span className={`${icon} text-lg ${isActive ? '' : 'group-hover:text-white'} ${!open && 'text-xl'}`}></span>
                                        {open && <span className="ml-3 font-medium text-sm">{label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile / Bottom Section */}
                <div className={`mt-auto p-3 border-t border-gray-700/50 ${open ? 'flex items-center' : 'text-center'}`}>
                    <div className={`${open ? 'flex items-center' : 'flex flex-col items-center'} w-full`}>
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="ri-user-line"></span>
                        </div>
                        {open && (
                            <div className="ml-3 leading-tight">
                                <p className="text-sm font-medium">User Name</p>
                                <p className="text-xs text-gray-400">user@example.com</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}