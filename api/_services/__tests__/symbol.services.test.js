jest.mock('faunadb')

import { fetchSymbol } from '../symbol.services'
import faunadb from 'faunadb'

const faunaClient = faunadb.Client

describe('Symbol services', () => {
    describe('fetchSymbol', () => {
        describe('When the symbol is found', () => {
            beforeEach(() => {
                faunadb.Client = class Client {
                    async query() {
                        return {
                            data: {
                                symbol: 'ABC',
                            },
                        }
                    }
                }
            })
            afterEach(() => {
                faunadb.Client = faunaClient
            })

            it('should return the symbol with found attr as true', async (done) => {
                const result = await fetchSymbol('ABC')
                expect(result).toEqual({ found: true, symbol: 'ABC' })
                done()
            })
        })

        describe('When the symbol is not found', () => {
            beforeEach(() => {
                faunadb.Client = class Client {
                    async query() {
                        throw new Error()
                    }
                }
            })

            afterEach(() => {
                faunadb.Client = faunaClient
            })

            it('should return the symbol with found attr as false', async (done) => {
                const result = await fetchSymbol('XYZ')
                expect(result).toEqual({ found: false, symbol: 'XYZ' })
                done()
            })
        })
    })
})
