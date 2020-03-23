import faunadb from 'faunadb'
const q = faunadb.query

export default async (request, response) => {
    const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY })

    const input = request.query.symbol.toUpperCase()

    try {
        const symbol = await client.query(
            q.Get(
                q.Match(q.Index('get_by_symbol'), input)
            )
        )

        response.status(200).json(symbol.data) 
     } catch(err) {
        response.status(404).json() 
    }
}