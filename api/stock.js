import fetch from 'node-fetch'
require('dotenv').config()

export default async (request, response) => {
    const endpoint = 'https://finnhub.io/api/v1/stock/candle'
    const symbols = request.query.symbols.split(',')

    if (symbols && symbols.length > 0) {
        const API_KEY = process.env.FINNHUB_API_KEY
        const firstDayOf2020 = '01/02/2020'

        let numberOfDays = 0

        const promises = symbols.map((symbol) => {
            const from = Math.floor(new Date(firstDayOf2020).getTime() / 1000)
            const to = Math.floor(new Date().getTime() / 1000)

            return fetch(
                `${endpoint}?symbol=${symbol.toUpperCase()}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`
            ).then((res) => res.json())
        })

        const results = await Promise.all(promises)
        let data = []

        results.map((res, idx) => {
            const { c, o, h, l, t, s } = res
            const symbol = symbols[idx]

            if (s !== 'no_data') {
                data.push({
                    close: c,
                    open: o,
                    high: h,
                    low: l,
                    time: t,
                    symbol,
                })

                numberOfDays = t.length
            }
        })

        response.status(200).json({ series: data, days: numberOfDays })
    }

    response.status(400)
}
