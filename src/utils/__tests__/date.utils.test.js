import { padZero, getDateFromTimestamp } from '../date.utils'

process.TZ = 'UTC'

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
        describe('When the timestamp represents 10/04/2020', () => {
            it('should return the timestamp converted to dd/mm/yyyy format', () => {
                expect(getDateFromTimestamp(1586558807)).toEqual('10/04/2020')
            })
        })

        describe('When the timestamp represents 07/04/2020', () => {
            it('should return the timestamp converted to dd/mm/yyyy format', () => {
                expect(getDateFromTimestamp(1586299607)).toEqual('07/04/2020')
            })
        })
    })
})
