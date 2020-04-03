import faunadb from 'faunadb'
const q = faunadb.query

export const fetchSymbol = async (symbol) => {
    const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY })

    try {
        const found = await client.query(
            q.Get(q.Match(q.Index('get_by_symbol1'), symbol))
        )
        return { symbol: found.data.symbol, found: true }
    } catch (err) {
        return { symbol, found: false }
    }
}
