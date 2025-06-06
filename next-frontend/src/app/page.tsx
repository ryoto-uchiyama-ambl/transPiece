export default function Home() {
  return (
    <div className="flex justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-h-[300px] max-w-full w-full bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-gray-700/50 ml-60 mr-60 mt-20">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-100 tracking-tight">英語で読む名著</h1>
        <p className="text-gray-300 mb-8 text-center leading-relaxed">
          英語を学びながら、世界の名作を体験しよう。
        </p>
        <div className="flex flex-col gap-4">
          <a href="/login">
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
              ログイン
            </button>
          </a>
          <a href="/register">
            <button className="w-full bg-gray-700 text-gray-100 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium border border-gray-600/50 hover:border-gray-500">
              新規登録
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
