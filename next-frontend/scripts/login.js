module.exports = async function login(page, options) {
    // Laravel Sanctum のCSRF Cookie取得
    await page.goto('http://localhost:8000/sanctum/csrf-cookie', { waitUntil: 'networkidle0' });

    // Next.js のログイン画面へ遷移（またはSPA上のログインUI）
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });

    // フォームにメール・パスワード入力
    await page.type('input[name=email]', 'tes@tes');
    await page.type('input[name=password]', 'password');

    // ログインボタンをクリック
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('button[type=submit]')
    ]);

    // ログイン後のクッキーは自動的にブラウザに保存されるので、そのまま使われる
};
