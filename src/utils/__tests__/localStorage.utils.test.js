import '@testing-library/jest-dom/extend-expect'
import {
    getLocalStorageItem,
    setLocalStorageItem,
    removeLocalStorageItem,
} from '../localStorage.utils'

const getItemSpy = jest.fn()
const setItemSpy = jest.fn()
const removeItemSpy = jest.fn()

Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: removeItemSpy,
    },
})

describe('Local storage utils', () => {
    describe('getLocalStorageItem', () => {
        it('should get item from local storage', () => {
            getLocalStorageItem('some-key')
            expect(getItemSpy).toHaveBeenCalledTimes(1)
            expect(getItemSpy).toHaveBeenCalledWith('some-key')
        })
    })

    describe('setLocalStorageItem', () => {
        it('should set item into local storage', () => {
            setLocalStorageItem('some-key', 10)
            expect(setItemSpy).toHaveBeenCalledTimes(1)
            expect(setItemSpy).toHaveBeenCalledWith('some-key', 10)
        })
    })

    describe('removeLocalStorageItem', () => {
        it('should remove item from local storage', () => {
            removeLocalStorageItem('some-key')
            expect(removeItemSpy).toHaveBeenCalledTimes(1)
            expect(removeItemSpy).toHaveBeenCalledWith('some-key')
        })
    })
})
