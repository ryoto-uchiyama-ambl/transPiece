import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // Next.jsのローカルURLを指定（適宜変更してください）
    specPattern: "cypress/e2e/**/*.cy.{js,ts}", // テストファイルのパターン指定（推奨）
    supportFile: "cypress/support/e2e.ts", // サポートファイルの指定（あれば）
    redirectionLimit: 0, // リダイレクトを無効化
    setupNodeEvents(on, config) {
      // nodeイベントの処理をここに実装できます
    },
  },
});
