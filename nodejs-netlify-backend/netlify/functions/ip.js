exports.handler = async (event) => {
  const ip =
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for'] ||
    'unknown';

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ip, userAgent: event.headers['user-agent'] || null, at: new Date().toISOString() }),
  };
};
