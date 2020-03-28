describe('Side panel', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('should add and remove symbols', () => {
        let stub = cy.stub()
        cy.on('window:alert', stub)

        cy.findAllByText(/COVID-19 vs. Markets/i).should('exist')

        cy.findAllByText(/\$DHY/i).should('exist')
        cy.findAllByText(/\$BLE/i).should('exist')
        cy.findAllByText(/\$JPM/i).should('exist')
        cy.findAllByText(/\$SPY/i).should('exist')

        cy.findAllByLabelText(/Remove symbol/i)
            .should('exist')
            .first()
            .click()

        cy.findAllByLabelText(/Empty symbol slot/i)

        cy.findAllByText(/\$DHY/i).should('not.exist')

        cy.findAllByPlaceholderText(/Add a new symbol/i)
            .should('exist')
            .type('CYPRESS')
            .type('{enter}')
            .then(() => {
                expect(stub.getCall(0)).to.be.calledWith(
                    'Symbol should be between 1-5 characters excluding $: CYPRESS'
                )
            })

        cy.findAllByPlaceholderText(/Add a new symbol/i)
            .should('exist')
            .type('AAMC')

        cy.findAllByLabelText(/Add symbol/i)
            .should('exist')
            .should('not.be.disabled')
            .click()

        cy.findAllByText(/\$AAMC/i).should('exist')

        cy.findAllByPlaceholderText(/Add a new symbol/i)
            .should('be.empty')
            .should('be.disabled')

        cy.findAllByLabelText(/Add symbol/i).should('be.disabled')
    })
})
