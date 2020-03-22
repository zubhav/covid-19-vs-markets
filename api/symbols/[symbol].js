import symbols from '../_data/symbols.json'
import faunadb from 'faunadb'
const q = faunadb.query
const dbClient = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY })

export default (request, response) => {
    const input = request.query.symbol.toUpperCase()
    
    console.log(input)
    try {
        dbClient.query(
            q.Match(q.Index('get_by_symbol'), 'ABMD')
          )
          .then(res => console.log(res))
          .catch(err => console.log(err))
     } catch(err) {
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