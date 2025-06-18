describe('ログインページ', () => {
    it('正しい認証情報でログインできる', () => {
        cy.visit('/login');
        cy.get('input[type="email"]').type('tes@tes');
        cy.get('input[type="password"]').type('password');
        cy.contains('ログイン').click();
        cy.url({ timeout: 10000 }).should('include', '/home');
    });

    it('間違った認証情報でエラーメッセージが表示される', () => {
        cy.visit('/login');
        cy.get('input[type="email"]').type('wrong@example.com');
        cy.get('input[type="password"]').type('wrongpassword');
        cy.contains('ログイン').click();
        cy.contains('ログイン失敗').should('be.visible');
    });

    it('新規登録リンクが存在し、クリックで遷移する', () => {
        cy.visit('/login');
        cy.contains('新規登録').should('be.visible').click();
        cy.url().should('include', '/register');
    });
});