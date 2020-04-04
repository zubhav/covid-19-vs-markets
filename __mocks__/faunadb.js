class Client {
    query() {}
}

const query = {
    Get: () => {},
    Match: () => {},
    Index: () => {},
}

const fauna = {
    Client: Client,
    query: query,
}

export default fauna
