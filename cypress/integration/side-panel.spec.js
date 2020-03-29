describe('Side panel', () => {
    describe('polyfill window.fetch from tests', function() {
        let polyfill

        before(() => {
            const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js'
            cy.request(polyfillUrl).then(response => {
                polyfill = response.body
            })
        })

        beforeEach(() => {
            cy.server()
            cy.route({
                method: 'GET',
                url: '/api/stock?symbols=DHY,BLE,JPM,SPY',
                response: {
                    series: [
                        {
                            close: [2.49],
                            open: [2.49],
                            high: [2.49],
                            low: [2.49],
                            symbol: 'DHY',
                        },
                        {
                            close: [3.49],
                            open: [3.49],
                            high: [3.49],
                            low: [3.49],
                            symbol: 'BLE',
                        },
                        {
                            close: [4.49],
                            open: [4.49],
                            high: [4.49],
                            low: [4.49],
                            symbol: 'JPM',
                        },
                        {
                            close: [5.49],
                            open: [5.49],
                            high: [5.49],
                            low: [5.49],
                            symbol: 'SPY',
                        },
                    ],
                    labels: [1577975400],
                },
            })

            cy.route({
                method: 'GET',
                url: '/api/stock?symbols=AAMC',
                response: {
                    series: [
                        {
                            close: [2.49],
                            open: [2.49],
                            high: [2.49],
                            low: [2.49],
                            symbol: 'AAMC',
                        },
                    ],
                    labels: [1577975400],
                },
            })

            cy.route({
                method: 'GET',
                url: '/api/symbols/AAMC',
                response: {
                    symbol: 'AAMC',
                    title: 'Some title',
                },
            })

            cy.visit('/', {
                onBeforeLoad(win) {
                    delete win.fetch
                    win.eval(polyfill)
                    win.fetch = win.unfetch
                },
            })
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
})
