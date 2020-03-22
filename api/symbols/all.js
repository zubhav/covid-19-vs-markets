import symbols from '../_data/symbols.json'

export default (request, response) => {
    response.status(200).json(symbols)
}