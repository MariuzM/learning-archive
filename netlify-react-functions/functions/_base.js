exports.handler = (event, context, callback) => {
  return callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    },
    body: JSON.stringify({
      data: '- Message from Server',
    }),
  })
}
