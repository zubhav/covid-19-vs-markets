import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/svelte'
import Card from '../Card.svelte'

describe('Card', () => {
    describe('When the card is rendered with close option selected', () => {
        it('should render the card with the correct values and green close option', () => {
            const { getByText } = render(Card, {
                item: { symbol: 'ABCD', close: [1, 2, 3], open: [4, 5, 6] },
                color: 'purple',
                options: [
                    {
                        label: 'Close',
                        value: 'close',
                    },
                    {
                        label: 'Open',
                        value: 'open',
                    },
                ],
                selected: 'close',
                current: 1,
            })

            expect(getByText('$ABCD')).toBeInTheDocument()
            expect(getByText('Close (selected)')).toBeInTheDocument()
            expect(getByText('2')).toBeInTheDocument()
            expect(getByText('2')).toHaveStyle('color: green')
        })
    })

    describe('When the card is rendered with open option selected', () => {
        it('should render the card with the correct values and color', () => {
            const { getByText } = render(Card, {
                item: { symbol: 'XYZ', open: [3, 2, 1], close: [4, 5, 6] },
                color: 'purple',
                options: [
                    {
                        label: 'Close',
                        value: 'close',
                    },
                    {
                        label: 'Open',
                        value: 'open',
                    },
                ],
                selected: 'open',
                current: 2,
            })

            expect(getByText('$XYZ')).toBeInTheDocument()
            expect(getByText('Open (selected)')).toBeInTheDocument()
            expect(getByText('1')).toBeInTheDocument()
            expect(getByText('1')).toHaveStyle('color: red')
        })
    })
})
