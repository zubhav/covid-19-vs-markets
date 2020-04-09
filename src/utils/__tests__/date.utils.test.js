import '@testing-library/jest-dom/extend-expect'
import { padZero, getDateFromTimestamp } from '../date.utils'

describe('Date utils', () => {
    describe('padZero', () => {
        describe('When the input is between 0 and 9', () => {
            it('should return number with zero padding', () => {
                expect(padZero(5)).toEqual('05')
            })
        })

        describe('When the input is greater than 9', () => {
            it('should return number without zero padding', () => {
                expect(padZero(15)).toEqual('15')
            })
        })
    })

    describe('getDateFromTimestamp', () => {
        describe('When the timestamp represents 08/04/2020', () => {
            it('should return the timestamp converted to dd/mm/yyyy format', () => {
                expect(getDateFromTimestamp(1586473214)).toEqual('09/04/2020')
            })
        })

        describe('When the timestamp represents 8/04/2020', () => {
            it('should return the timestamp converted to dd/mm/yyyy format', () => {
                expect(getDateFromTimestamp(1586386984)).toEqual('08/04/2020')
            })
        })
    })
})
