import '@testing-library/jest-dom/extend-expect'
import { fetchFromApi } from '../fetchFromApi.utils'

const fetchSpy = jest.fn().mockImplementation(() => 'fetch')

describe('Fetch utils', () => {
    beforeEach(() => {
        fetchSpy.mockClear()
        window.fetch = fetchSpy
    })

    describe('When options are not supplied', () => {
        it('should invoke fetch with empty options', () => {
            const res = fetchFromApi('/path')
            expect(window.fetch).toHaveBeenCalledTimes(1)
            expect(window.fetch).toHaveBeenCalledWith('/path', {})
            expect(res).toEqual('fetch')
        })
    })

    describe('When options are supplied', () => {
        it('should invoke fetch with options', () => {
            const res = fetchFromApi('/path', { method: 'GET' })
            expect(window.fetch).toHaveBeenCalledTimes(1)
            expect(window.fetch).toHaveBeenCalledWith('/path', {
                method: 'GET',
            })
            expect(res).toEqual('fetch')
        })
    })
})
