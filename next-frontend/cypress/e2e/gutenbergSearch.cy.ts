describe('ホームページ', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.visit('/login');
        cy.get('input[type="email"]').type('tes@tes');
        cy.get('input[type="password"]').type('password');
        cy.contains('ログイン').click();
        cy.visit('/gutenberg/gutenbergSearch');
        cy.url({ timeout: 20000 }).should('include', '/gutenberg/gutenbergSearch');
    })
    it('認証後表示がされる', () => {
        cy.contains('名著を検索').should('exist');
    });
    it('検索ができる', () => {
        cy.get('input[type="text"]').type('faust');
        cy.get('button').filter(':contains("検索")').click();
        cy.contains('Faust').should('exist');
        cy.get('.divide-y > :nth-child(1)').click();
        cy.url({ timeout: 20000 }).should('include', '/gutenberg/gutenbergView');
    });
});