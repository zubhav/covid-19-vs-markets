import symbols from '../_data/symbols.json'

export default (request, response) => {
    const input = request.query.symbol.toUpperCase()
    const symbol = symbols.find(item => item.symbol === input)

    if(symbol) {
        response.status(200).json(symbol) 
    } else {
        response.status(404).json()
    }
}