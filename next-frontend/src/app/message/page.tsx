"use client";

import { useState, useRef, useEffect } from 'react';
import "remixicon/fonts/remixicon.css";
import CollapsibleSidebar from './CollapsibleSidebar'; // サイドバーコンポーネントをインポート

export default function MessagePage() {
    const [messages, setMessages] = useState([
        { id: 1, text: "こんにちは！何かお手伝いできることはありますか？", isUser: false, timestamp: new Date() }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // 自動スクロール機能
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // メッセージ送信処理
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (inputMessage.trim() === "") return;

        // ユーザーメッセージを追加
        const userMessage = {
            id: messages.length + 1,
            text: inputMessage,
            isUser: true,
            timestamp: new Date()
        };

        setMessages([...messages, userMessage]);
        setInputMessage("");
        setIsTyping(true);

        // MCP APIとの通信をシミュレート
        setTimeout(() => {
            const aiResponse = {
                id: messages.length + 2,
                text: getAIResponse(inputMessage),
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    // AIレスポンスのシミュレーション（実際の実装ではMCP APIを使用）
    const getAIResponse = (input) => {
        const responses = [
            "なるほど、興味深いですね。もう少し詳しく教えていただけますか？",
            "ご質問ありがとうございます。お力になれると思います。",
            "その件については、様々な観点から考えることができます。",
            "ご要望の内容について検討してみました。いくつか案がありますが、いかがでしょうか？",
            "その問題を解決するためのアプローチをいくつか考えてみましょう。"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    // タイムスタンプのフォーマット
    const formatTimestamp = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* メインコンテンツ - メッセージエリア */}
            <div className="flex-1 ml-16 lg:ml-64">
                <div className="h-screen flex flex-col">
                    {/* ヘッダー */}
                    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                <i className="ri-robot-line text-xl"></i>
                            </div>
                            <div className="ml-3">
                                <h1 className="font-semibold text-lg">AI アシスタント</h1>
                                <p className="text-xs text-gray-500">オンライン</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <i className="ri-information-line text-gray-600"></i>
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <i className="ri-settings-4-line text-gray-600"></i>
                            </button>
                        </div>
                    </header>

                    {/* メッセージリスト */}
                    <div
                        className="overflow-y-auto p-6 bg-gray-50"
                        style={{ height: 'calc(100vh - 200px)' }} // ヘッダー + フッターの高さぶん減らす
                    >
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-end space-x-2 ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        {!message.isUser && (
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white">
                                                <i className="ri-robot-line"></i>
                                            </div>
                                        )}
                                        <div
                                            className={`px-4 py-3 rounded-2xl max-w-md ${message.isUser
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white shadow-sm rounded-tl-none'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{message.text}</p>
                                            <span
                                                className={`text-xs block mt-1 ${message.isUser ? 'text-indigo-200' : 'text-gray-400'
                                                    }`}
                                            >
                                                {formatTimestamp(message.timestamp)}
                                            </span>
                                        </div>
                                        {message.isUser && (
                                            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
                                                <i className="ri-user-line text-gray-600"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* タイピングインジケーター */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex items-end space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white">
                                            <i className="ri-robot-line"></i>
                                        </div>
                                        <div className="px-4 py-3 rounded-2xl max-w-md bg-white shadow-sm rounded-tl-none">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* 入力エリア */}
                    <footer className="bg-white border-t border-gray-200 py-4 px-6">
                        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
                            <div className="relative flex items-center">
                                <button
                                    type="button"
                                    className="absolute left-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <i className="ri-emotion-line text-xl"></i>
                                </button>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="メッセージを入力..."
                                    className="w-full py-3 px-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                />
                                <button
                                    type="button"
                                    className="absolute right-16 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <i className="ri-attachment-2 text-xl"></i>
                                </button>
                                <button
                                    type="submit"
                                    disabled={inputMessage.trim() === ""}
                                    className={`absolute right-4 p-1 ${inputMessage.trim() === "" ? "text-gray-400" : "text-indigo-600 hover:text-indigo-700"
                                        } transition-colors`}
                                >
                                    <i className="ri-send-plane-fill text-xl"></i>
                                </button>
                            </div>
                        </form>
                    </footer>
                </div>
            </div>
        </div>
    );
}