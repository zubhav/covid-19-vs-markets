import fetch from 'node-fetch'
require('dotenv').config()

const getTimestampFromDateStr = (dt) => Math.floor(dt.getTime() / 1000)

export default async (request, response) => {
    const API_ENDPOINT = 'https://finnhub.io/api/v1/stock/candle'
    const symbolList = request.query.symbols.split(',')

    if (symbolList && symbolList.length > 0) {
        const API_KEY = process.env.FINNHUB_API_KEY
        const FIRST_DAY_2020 = '01/02/2020'

        const promises = symbolList.map((symbol) => {
            const from = getTimestampFromDateStr(new Date(FIRST_DAY_2020))
            const to = getTimestampFromDateStr(new Date())

            return fetch(
                `${API_ENDPOINT}?symbol=${symbol.toUpperCase()}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`
            ).then((res) => res.json())
        })

        const results = await Promise.all(promises)

        let data = []
        let dates = new Set()

        results.map((res, idx) => {
            const { c, o, h, l, t, s } = res
            const symbol = symbolList[idx]

            if (s !== 'no_data') {
                data.push({
                    close: c,
                    open: o,
                    high: h,
                    low: l,
                    symbol,
                })

                dates.add(t)
            }
        })

        response.status(200).json({ series: data, labels: Array.from(dates) })
    }

    response.status(400)
}
