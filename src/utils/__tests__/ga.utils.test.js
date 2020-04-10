import { ga } from '../ga.utils'

describe('Google analytics utils', () => {
    const createElementSpy = jest.fn().mockImplementation(() => {
        return { src: '' }
    })
    const appendChildSpy = jest.fn()

    beforeEach(() => {
        Object.defineProperty(document, 'createElement', {
            value: createElementSpy,
        })

        Object.defineProperty(document, 'body', {
            value: {
                appendChild: appendChildSpy,
            },
        })
    })

    it('should invoke create script element and append to document', () => {
        ga('some-ga-id')

        expect(createElementSpy).toHaveBeenCalledTimes(1)
        expect(createElementSpy).toHaveBeenCalledWith('script')

        expect(appendChildSpy).toHaveBeenCalledTimes(1)
        expect(appendChildSpy).toHaveBeenCalledWith({
            src: 'https://www.googletagmanager.com/gtag/js?id=some-ga-id',
        })
    })
})
