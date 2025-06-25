// app/verify/success/page.tsx
export default function VerifySuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded p-8 text-center">
                <h1 className="text-2xl font-bold text-green-600 mb-4">✅ メール認証完了</h1>
                <p className="text-gray-700 mb-6">あなたのメールアドレスは正常に認証されました。</p>
                <a
                    href="/"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                    トップページへ
                </a>
            </div>
        </div>
    );
}
