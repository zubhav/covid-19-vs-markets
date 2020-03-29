describe('Main', () => {
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

            cy.visit('/', {
                onBeforeLoad(win) {
                    delete win.fetch
                    win.eval(polyfill)
                    win.fetch = win.unfetch
                },
            })
        })

        it('should show chart with information', () => {
            cy.wait('@allStockDataRequest')

            cy.findAllByText(/COVID-19 vs. Markets/i).should('exist')

            cy.findAllByDisplayValue(/High/i).should('exist')
            cy.findAllByDisplayValue(/Low/i).should('exist')
            cy.findAllByDisplayValue(/Open/i).should('exist')
            cy.findAllByDisplayValue(/Close/i)
                .should('exist')
                .should('be.checked')

            cy.findAllByText(/Selected date/i).should('exist')

            cy.findByTestId('current-day')
                .should('exist')
                .contains('5')

            cy.findAllByLabelText(/Date slider/i)
                .as('range')
                .invoke('val', 2)
                .trigger('change')

            cy.findByTestId('current-day')
                .should('exist')
                .contains('3')

            cy.findAllByDisplayValue(/High/i)
                .should('exist')
                .click()
        })
    })
})
