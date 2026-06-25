exports.handler = async (event) => {
  const name = event.queryStringParameters?.name || 'world';
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: `hello, ${name}` }),
  };
};
