describe('Query', () => {
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
                url: '/api/stock?symbols=AMZN,GOOGL,SHOP,MSFT',
                response: {
                    series: [
                        {
                            close: [2.49, 2.49, 2.49, 2.5, 2.49],
                            open: [2.49, 2.49, 2.49, 2.5, 2.49],
                            high: [2.49, 2.49, 2.49, 2.5, 2.49],
                            low: [2.49, 2.49, 2.49, 2.5, 2.49],
                            symbol: 'AMZN',
                        },
                        {
                            close: [15.11, 15.28, 15.29, 15.42, 15.38],
                            open: [15.11, 15.28, 15.29, 15.42, 15.38],
                            high: [15.11, 15.28, 15.29, 15.42, 15.38],
                            low: [15.11, 15.28, 15.29, 15.42, 15.38],
                            symbol: 'GOOGL',
                        },
                        {
                            close: [141.09, 138.34, 138.23, 135.88, 136.94],
                            open: [141.09, 138.34, 138.23, 135.88, 136.94],
                            high: [141.09, 138.34, 138.23, 135.88, 136.94],
                            low: [141.09, 138.34, 138.23, 135.88, 136.94],
                            symbol: 'SHOP',
                        },
                        {
                            close: [324.87, 322.41, 323.64, 322.73, 324.45],
                            open: [324.87, 322.41, 323.64, 322.73, 324.45],
                            high: [324.87, 322.41, 323.64, 322.73, 324.45],
                            low: [324.87, 322.41, 323.64, 322.73, 324.45],
                            symbol: 'MSFT',
                        },
                    ],
                    labels: [
                        1577975400,
                        1578061800,
                        1578321000,
                        1578407400,
                        1578493800,
                    ],
                },
            }).as('allStockDataRequest')

            cy.route({
                method: 'GET',
                url: '/api/stock?symbols=UBER,LYFT',
                response: {
                    series: [
                        {
                            close: [2.49, 2.49, 2.49, 2.5, 2.49],
                            open: [2.49, 2.49, 2.49, 2.5, 2.49],
                            high: [2.49, 2.49, 2.49, 2.5, 2.49],
                            low: [2.49, 2.49, 2.49, 2.5, 2.49],
                            symbol: 'UBER',
                        },
                        {
                            close: [15.11, 15.28, 15.29, 15.42, 15.38],
                            open: [15.11, 15.28, 15.29, 15.42, 15.38],
                            high: [15.11, 15.28, 15.29, 15.42, 15.38],
                            low: [15.11, 15.28, 15.29, 15.42, 15.38],
                            symbol: 'LYFT',
                        },
                    ],
                    labels: [
                        1577975400,
                        1578061800,
                        1578321000,
                        1578407400,
                        1578493800,
                    ],
                },
            }).as('partialStockDataRequest')

            cy.route({
                method: 'GET',
                url: '/api/stock?symbols=SPY',
                response: {
                    series: [
                        {
                            close: [111.09, 108.34, 109.23, 105.88, 118.94],
                            open: [111.09, 108.34, 109.23, 105.88, 118.94],
                            high: [111.09, 108.34, 109.23, 105.88, 118.94],
                            low: [111.09, 108.34, 109.23, 105.88, 118.94],
                            symbol: 'SPY',
                        },
                    ],
                    labels: [
                        1577975400,
                        1578061800,
                        1578321000,
                        1578407400,
                        1578493800,
                    ],
                },
            }).as('singleStockDataRequest')

            cy.route({
                method: 'GET',
                url: '/api/symbols/SPY',
                response: {
                    symbol: 'SPY',
                    title: 'Some title',
                },
            }).as('symbolRequest')
        })

        describe('When the url does not contain query params', () => {
            beforeEach(() => {
                cy.visit('/', {
                    onBeforeLoad(win) {
                        delete win.fetch
                        win.eval(polyfill)
                        win.fetch = win.unfetch
                    },
                })
            })

            it('should add query params to the url', () => {
                cy.wait('@allStockDataRequest')

                cy.findAllByText(/COVID-19 vs. Markets/i).should('exist')

                cy.findAllByDisplayValue(/Close/i)
                    .should('exist')
                    .should('be.checked')

                cy.location().should(loc => {
                    expect(loc.search).to.eq(
                        '?symbols=AMZN,GOOGL,SHOP,MSFT&price=close'
                    )
                })
            })
        })

        describe('When the url contains query params', () => {
            beforeEach(() => {
                cy.visit('/?symbols=UBER,LYFT&price=high', {
                    onBeforeLoad(win) {
                        delete win.fetch
                        win.eval(polyfill)
                        win.fetch = win.unfetch
                    },
                })
            })

            it('should populate stocks and price option from the query params', () => {
                cy.wait('@partialStockDataRequest')

                cy.findAllByText(/COVID-19 vs. Markets/i).should('exist')

                cy.findAllByDisplayValue(/High/i)
                    .should('exist')
                    .should('be.checked')

                cy.findAllByText(/\$UBER/i).should('exist')
                cy.findAllByText(/\$LYFT/i).should('exist')

                cy.location().should(loc => {
                    expect(loc.search).to.eq('?symbols=UBER,LYFT&price=high')
                })
            })

            describe('and a stock is added and price option is changed', () => {
                it('should update the query params', () => {
                    cy.wait('@partialStockDataRequest')

                    cy.findAllByText(/COVID-19 vs. Markets/i).should('exist')

                    cy.findAllByPlaceholderText(/Add a new symbol/i)
                        .should('exist')
                        .type('SPY')
                        .type('{enter}')

                    cy.findAllByText(/\$SPY/i).should('exist')

                    cy.location().should(loc => {
                        expect(loc.search).to.eq(
                            '?symbols=UBER,LYFT,SPY&price=high'
                        )
                    })

                    cy.findAllByDisplayValue(/Low/i)
                        .should('exist')
                        .click()

                    cy.location().should(loc => {
                        expect(loc.search).to.eq(
                            '?symbols=UBER,LYFT,SPY&price=low'
                        )
                    })
                })
            })
        })
    })
})
