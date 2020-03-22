import symbols from '../_data/symbols.json'
import faunadb from 'faunadb'
const q = faunadb.query

export default async (request, response) => {
    const input = request.query.symbol.toUpperCase()

    const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY })

    try {
        console.log('make the query ==========')

        const a = await client.query(
            q.Match(q.Index('get_by_symbol'), input)
        )
        
        a.then(res => console.log(res))
        console.log('reach end ==========')
     } catch(err) {
        console.log('CATCH ==========')
        console.log(err)
        response.status(500).json(err) 
    }

    const symbol = symbols.find(item => item.symbol === input)

    if(symbol) {
        response.status(200).json(symbol) 
    } else {
        response.status(404).json()
    }
}