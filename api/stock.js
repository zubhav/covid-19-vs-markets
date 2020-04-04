import fetch from 'node-fetch'
import { fetchSymbol } from './_services/symbol.services'
require('dotenv').config()

const convertMsToS = (n) => n / 1000

const getTimestampFromDateStr = (dt) => convertMsToS(Math.floor(dt.getTime()))

export default async (request, response) => {
    const API_ENDPOINT = 'https://finnhub.io/api/v1/stock/candle'
    const API_KEY = process.env.FINNHUB_API_KEY
    const FIRST_DAY_2020 = '01/02/2020'
    const CURRENT_DAY_MIDNIGHT = new Date().setHours(0, 0, 0, 0)

    const from = getTimestampFromDateStr(new Date(FIRST_DAY_2020))
    const to = convertMsToS(CURRENT_DAY_MIDNIGHT)

    const querySymbols = request.query.symbols
    const symbolList = querySymbols ? querySymbols.split(',') : []

    if (symbolList.length > 0) {
        const verifySymbolPromises = symbolList.map((symbol) =>
            fetchSymbol(symbol)
        )

        let verifySymbolResults = []
        try {
            verifySymbolResults = await Promise.all(verifySymbolPromises)
        } catch (e) {
            response.status(500)
        }

        const fetchSymbolDataPromises = verifySymbolResults.map(
            ({ symbol, found }) => {
                if (found) {
                    return fetch(
                        `${API_ENDPOINT}?symbol=${symbol.toUpperCase()}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`
                    ).then((res) => res.json())
                }

                return Promise.resolve(null)
            }
        )

        let fetchSymbolDataResults = []

        try {
            fetchSymbolDataResults = await Promise.all(fetchSymbolDataPromises)
        } catch (e) {
            response.status(500)
        }

        let data = []
        let dates = []

        fetchSymbolDataResults.map((res, idx) => {
            const symbol = symbolList[idx]

            if (res) {
                const { c, o, h, l, t, s } = res
                if (s !== 'no_data') {
                    data.push({
                        close: c,
                        open: o,
                        high: h,
                        low: l,
                        symbol,
                    })

                    if (dates.length === 0) {
                        dates = t
                    }
                }
            } else {
                data.push({
                    symbol,
                    error: true,
                })
            }
        })

        response.status(200).json({ series: data, labels: dates })
    }

    response.status(400)
}
