"use client";

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import "remixicon/fonts/remixicon.css";
import Link from 'next/link';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function CollapsibleSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [currentBookId, setCurrentBookId] = useState<string | null>(null);
    const hiddenSidebarRoutes = ["/login", "/register", "/"];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/api/user');
                setUser(res.data);
            } catch {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!userMenuOpen) return;

        const handleClick = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [userMenuOpen]);

    useEffect(() => {
        if (['/login', '/register', '/'].includes(pathname)) {
        return;
        }
        const fetchCurrentBook = async () => {
            try {
                const res = await api.get('/api/getCurrentBook');
                const bookId = res.data.current_book;

                if (bookId) {
                    setCurrentBookId(bookId);
                } else {
                    setCurrentBookId(null);
                }
            }
            catch (error) {
                console.error('現在のブック取得エラー', error);
                setCurrentBookId(null);
            }
        }
        fetchCurrentBook();
    }, []);

    if (hiddenSidebarRoutes.includes(pathname)) {
        return null;
    }

    const handleLogout = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.post('/api/logout');
            setUser(null);
            setUserMenuOpen(false);
            router.push('/login');
        } catch {
            alert('ログアウトに失敗しました');
        }
    }

    // const goToCurrentBook = () => {
    //     if (currentBookId) {
    //         router.push(`/book/${currentBookId}`);
    //     }else {
    //         alert('現在翻訳中の本はありません');
    //     }
    // }

    const links = [
        { href: "/home", icon: "ri-home-5-line", label: "Home" },
        { href: `/book/${currentBookId}`, icon: "ri-book-open-line", label: "Book" },
        { href: "/gutenberg/gutenbergSearch", icon: "ri-search-2-line", label: "BookSearch" },
        { href: "/vocaburary", icon: "ri-book-line", label: "Vocabulary" },
        { href: "/chart", icon: "ri-bar-chart-2-line", label: "Chart" },
        { href: "/message", icon: "ri-chat-3-line", label: "Message" },
        { href: "/user", icon: "ri-user-3-line", label: "User" },
        { href: "/setting", icon: "ri-settings-4-line", label: "Setting" },
    ];

    return (
        <aside
            className={`${open ? 'w-64' : 'w-16'} bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 h-screen transition-all duration-300 fixed left-0 top-0 shadow-xl z-50`}
        >
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className={`flex items-center ${open ? 'justify-between' : 'justify-center'} py-6 px-4 border-b border-gray-700/50`}>
                    {open && <h1 className="font-bold text-xl tracking-tight">TransPiece</h1>}
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
                                        className={`flex items-center ${open ? 'justify-start' : 'justify-center'} ${isActive
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
                    <div
                        className={`${open ? 'flex items-center cursor-pointer relative' : 'flex flex-col items-center cursor-pointer'} w-full`}
                        onClick={() => setUserMenuOpen((v) => !v)}
                        tabIndex={0}
                    >
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="ri-user-line"></span>
                        </div>
                        {open && (
                            <div className="ml-3 leading-tight">
                                <p className="text-sm font-medium">{user ? user.name : 'User Name'}</p>
                                <p className="text-xs text-gray-400">{user ? user.email : 'user@example.com'}</p>
                            </div>
                        )}
                        {/* ユーザーメニュー */}
                        {userMenuOpen && (
                            <div
                                ref={userMenuRef}
                                className="absolute left-0 bottom-12 w-48 bg-gray-600 text-white rounded shadow-lg z-50 py-2"
                            >
                                <div className="px-4 py-2 border-b">
                                    <div className="font-semibold">{user?.name ?? 'User Name'}</div>
                                    <div className="text-xs text-gray-100">{user?.email ?? 'user@example.com'}</div>
                                </div>
                                <Link href="/user" className="block px-4 py-2 hover:bg-gray-100 hover:text-black">プロフィール</Link>
                                <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100 hover:text-black">設定</Link>
                                <button
                                    className="w-full text-center px-4 py-2 hover:bg-gray-100 text-red-500"
                                    onClick={handleLogout}
                                >
                                    ログアウト
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}