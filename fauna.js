var faunadb = require('faunadb'),
  q = faunadb.query

var client = new faunadb.Client({ secret: 'fnADnjmMpEACAIkViin0wJ_6acEKuShpHLl-dg7D' })

var helper = client.paginate(
    q.Match(q.Index('get_by_symbol'), "AAMC")
)

// helper.map(function(ref) {
//     console.log(q.Get(ref))
//     return q.Get(ref)
//   })
//   .each(function(page) {
//     console.log(page); // Logs the retrieved documents.
//   })

client.query(
    q.Get(
        q.Match(q.Index('get_by_symbol'), 'AAMC')
    )
  )
  .then((ret) => console.log(ret.data))