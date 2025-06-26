'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useRouter } from 'next/navigation';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    created_at: string;
    email_verified_at: string | null;
}

interface NotificationSettings {
    review_reminders: boolean;
    translation_feedback: boolean;
    weekly_progress: boolean;
    system_updates: boolean;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    // 初期値を明示的にbooleanで設定
    const [notifications, setNotifications] = useState<NotificationSettings>({
        review_reminders: false,
        translation_feedback: false,
        weekly_progress: false,
        system_updates: false
    });

    // プロファイル編集用の状態
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });

    // パスワード変更用の状態
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [messages, setMessages] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();
    const [isPushEnabled, setIsPushEnabled] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/api/user');
            } catch (err: any) {
                if (err.response && err.response.status === 401) {
                    router.push('/login');
                }
            }
        };

        const fetchUserData = async () => {
            try {
                await api.get('/sanctum/csrf-cookie');

                // プロファイル情報取得 (fun-015)
                const profileRes = await api.get('/api/user/profile');
                setProfile(profileRes.data);
                setProfileForm({ name: profileRes.data.name, email: profileRes.data.email });

                // 通知設定取得 (fun-018)
                const notificationRes = await api.get('/api/user/notificationSettings');
                
                // APIレスポンスを正規化してbooleanに変換
                const normalizedNotifications: NotificationSettings = {
                    review_reminders: Boolean(notificationRes.data?.review_reminders),
                    translation_feedback: Boolean(notificationRes.data?.translation_feedback),
                    weekly_progress: Boolean(notificationRes.data?.weekly_progress),
                    system_updates: Boolean(notificationRes.data?.system_updates),
                };
                
                setNotifications(normalizedNotifications);
            } catch (err: any) {
                if (err.response && err.response.status === 401) return;
                console.error('データ取得失敗:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
        fetchUserData();
    }, [router]);

    // プロファイル更新 (fun-017)
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.put('/api/user/profile', profileForm);

            setProfile(prev => prev ? { ...prev, ...profileForm } : null);
            setEditingProfile(false);
            setMessages({ type: 'success', text: 'プロファイルが正常に更新されました。' });

            setTimeout(() => setMessages(null), 3000);
        } catch (error: any) {
            setMessages({ type: 'error', text: error.response?.data?.message || 'プロファイル更新に失敗しました。' });
            setTimeout(() => setMessages(null), 3000);
        }
    };

    // パスワード変更 (fun-013)
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setMessages({ type: 'error', text: '新しいパスワードが一致しません。' });
            setTimeout(() => setMessages(null), 3000);
            return;
        }

        try {
            await api.get('/sanctum/csrf-cookie');
            await api.put('/api/user/password', {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            });

            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
            setMessages({ type: 'success', text: 'パスワードが正常に変更されました。' });

            setTimeout(() => setMessages(null), 3000);
        } catch (error: any) {
            setMessages({ type: 'error', text: error.response?.data?.message || 'パスワード変更に失敗しました。' });
            setTimeout(() => setMessages(null), 3000);
        }
    };

    // 通知設定更新 (fun-019) - 改善版
    const handleNotificationUpdate = async (key: keyof NotificationSettings, value: boolean) => {
        try {
            // まず楽観的更新でUIを即座に反映
            setNotifications(prev => ({ ...prev, [key]: value }));

            const updatedSettings = { ...notifications, [key]: value };

            await api.get('/sanctum/csrf-cookie');
            const res = await api.put('/api/user/notificationSettings', updatedSettings);

            // APIレスポンスで再度正規化
            const normalized: NotificationSettings = {
                review_reminders: Boolean(res.data?.review_reminders),
                translation_feedback: Boolean(res.data?.translation_feedback),
                weekly_progress: Boolean(res.data?.weekly_progress),
                system_updates: Boolean(res.data?.system_updates),
            };
            
            setNotifications(normalized);
            setMessages({ type: 'success', text: '通知設定が更新されました。' });

            setTimeout(() => setMessages(null), 3000);
        } catch (error: any) {
            // エラー時は元の状態に戻す
            setNotifications(prev => ({ ...prev, [key]: !value }));
            setMessages({ type: 'error', text: '通知設定の更新に失敗しました。' });
            setTimeout(() => setMessages(null), 3000);
        }
    };

    // ログアウト処理 (fun-014)
    const handleLogout = async () => {
        try {
            await api.post('/api/logout');
            router.push('/login');
        } catch (error) {
            console.error('ログアウト失敗:', error);
        }
    };

    // Push通知の有効化 (fun-020)
    const handlePushEnable = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('通知が拒否されました');
                return;
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            const reg = await navigator.serviceWorker.register('/sw.js');
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidPublicKey,
            });
            console.log(subscription.toJSON());
            await api.post('/api/user/pushSubscription', subscription.toJSON());

            setIsPushEnabled(true);
        } catch (e) {
            console.error('Push登録エラー:', e);
            alert('Push通知の登録に失敗しました');
        }
    };

    const tabs = [
        { id: 'profile', name: 'プロファイル', icon: 'ri-user-line' },
        { id: 'password', name: 'パスワード', icon: 'ri-lock-line' },
        { id: 'notifications', name: '通知設定', icon: 'ri-notification-line' },
        { id: 'account', name: 'アカウント', icon: 'ri-settings-line' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダーセクション */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        設定
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        アカウント設定と通知を管理する
                    </p>
                </div>

                {/* 成功・エラーメッセージ */}
                {messages && (
                    <div className={`mb-6 p-4 rounded-lg ${messages.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }`}>
                        <div className="flex items-center">
                            <span className={`${messages.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} mr-2`}></span>
                            {messages.text}
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                    {/* タブナビゲーション */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                        }`}
                                >
                                    <span className={`${tab.icon} mr-2`}></span>
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* タブコンテンツ */}
                    <div className="p-6">
                        {/* プロファイルタブ */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        プロファイル情報
                                    </h3>

                                    {editingProfile ? (
                                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    名前
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    メールアドレス
                                                </label>
                                                <input
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                                                >
                                                    保存
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingProfile(false);
                                                        setProfileForm({ name: profile?.name || '', email: profile?.email || '' });
                                                    }}
                                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                                                >
                                                    キャンセル
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{profile?.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => setEditingProfile(true)}
                                                    className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition"
                                                >
                                                    編集
                                                </button>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                <p>登録日: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : '---'}</p>
                                                <p>メール認証: {profile?.email_verified_at ? '完了' : '未完了'}</p>
                                                {!profile?.email_verified_at && (
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => window.location.href = '/setting/verifyEmail'}
                                                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                                                        >
                                                            メール認証へ進む
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* パスワードタブ */}
                        {activeTab === 'password' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    パスワード変更
                                </h3>

                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            現在のパスワード
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            新しいパスワード
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            新しいパスワード（確認）
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirm_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                                    >
                                        パスワードを変更
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* 通知設定タブ */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    通知設定
                                </h3>

                                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-800/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-yellow-800 dark:text-yellow-200">ブラウザ通知を許可</p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">通知を受け取るには、まずブラウザ通知を有効にする必要があります</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isPushEnabled}
                                            onChange={handlePushEnable}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { key: 'review_reminders', label: '復習リマインダー', description: 'FSRSアルゴリズムに基づいた復習通知を受け取る' },
                                        { key: 'translation_feedback', label: '翻訳フィードバック', description: 'AI評価とフィードバックの通知を受け取る' },
                                        { key: 'weekly_progress', label: '週次進捗レポート', description: '学習進捗の週間サマリーを受け取る' },
                                        { key: 'system_updates', label: 'システム更新', description: '重要なシステム更新やメンテナンス情報を受け取る' }
                                    ].map((setting) => (
                                        <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications[setting.key as keyof NotificationSettings] || false}
                                                    onChange={(e) => handleNotificationUpdate(setting.key as keyof NotificationSettings, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* アカウントタブ */}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    アカウント管理
                                </h3>

                                <div className="space-y-4">
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <span className="ri-logout-box-line text-yellow-600 dark:text-yellow-400 text-xl mt-0.5"></span>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-yellow-800 dark:text-yellow-300">ログアウト</h4>
                                                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                                    現在のセッションを終了します
                                                </p>
                                                <button
                                                    onClick={handleLogout}
                                                    className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition text-sm"
                                                >
                                                    ログアウト
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <span className="ri-delete-bin-line text-red-600 dark:text-red-400 text-xl mt-0.5"></span>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-red-800 dark:text-red-300">アカウント削除</h4>
                                                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                                    アカウントを完全に削除します。この操作は取り消すことができません。
                                                </p>
                                                <button
                                                    onClick={() => alert('この機能は実装中です')}
                                                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                                                >
                                                    アカウント削除
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}