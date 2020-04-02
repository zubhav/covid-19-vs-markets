const baseUrl =
    process.env.NODE_ENV === 'development'
        ? 'https://covid-19-vs-market.now.sh'
        : ''

export const fetchFromApi = (path, options = {}) => {
    return fetch(`${baseUrl}${path}`, options)
}
