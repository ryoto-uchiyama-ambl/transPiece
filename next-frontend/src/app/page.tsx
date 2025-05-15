import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-3xl font-bold mb-6 text-center">英語で読む名著</h1>
        <p className="text-gray-700 mb-6 text-center">
          英語を学びながら、世界の名作を体験しよう。
        </p>
        <div className="flex flex-col gap-4">
          <Link href="/login">
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              ログイン
            </button>
          </Link>
          <Link href="/register">
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              新規登録
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
