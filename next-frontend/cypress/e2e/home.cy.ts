describe('ホームページ', () => {
    beforeEach(() => {
        cy.visit('/login');
        cy.get('input[type="email"]').type('tes@tes');
        cy.get('input[type="password"]').type('password');
        cy.contains('ログイン').click();
        cy.url({ timeout: 20000 }).should('include', '/home');
    })
    it('認証後表示がされる', () => {
        cy.contains('あなたの本棚').should('exist');
        cy.get(':nth-child(1) > .flex > :nth-child(2) > .text-2xl').should('exist');
        cy.get(':nth-child(2) > .flex > :nth-child(2) > .text-2xl').should('exist');
        cy.get(':nth-child(3) > .flex > :nth-child(2) > .text-2xl').should('exist');
        cy.get(':nth-child(4) > .flex > :nth-child(2) > .text-2xl').should('exist');
        cy.get(':nth-child(1) > .h-30 > .absolute').should('exist');
        cy.get(':nth-child(1) > :nth-child(2) > .text-gray-700').should('exist');
        cy.get(':nth-child(1) > :nth-child(2) > .text-gray-700').should('exist');
        cy.get(':nth-child(1) > :nth-child(2) > .space-x-4 > :nth-child(2) > :nth-child(2)').should('exist');
        cy.get(':nth-child(1) > :nth-child(2) > .justify-between > .p-2 > .ri-bookmark-fill, .ri-bookmark-fill').should('exist');
    });
    it('お気に入りを変更できる', () => {
        cy.get('button')
            .eq(1)
            .within(() => {
                cy.get('span')
                    .invoke('attr', 'class')
                    .then((classNameBefore) => {
                        const isFavoriteBefore = classNameBefore?.includes('ri-bookmark-line') || classNameBefore?.includes('ri-bookmark-fill');

                        // トグルをクリック
                        cy.root().click();

                        // トグル後の状態を確認
                        cy.get('span')
                            .invoke('attr', 'class')
                            .should((classNameAfter) => {
                                const isFavoriteAfter = classNameAfter?.includes('ri-bookmark-(fill|line)');
                                expect(isFavoriteAfter).to.not.equal(isFavoriteBefore);
                            });
                    });
            });
    });
    it('本検索ページに遷移できる', () => {
        cy.contains('翻訳を試みる').click();
        cy.url({ timeout: 20000 }).should('include', '/book/1');
    })
});