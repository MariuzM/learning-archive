const isEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'method not allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid json' }) };
  }

  const { name, email, message } = payload;
  const errors = [];
  if (!name || name.length < 2) errors.push('name');
  if (!isEmail(email)) errors.push('email');
  if (!message || message.length < 10) errors.push('message');

  if (errors.length) {
    return {
      statusCode: 422,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: false, invalid: errors }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true, received: { name, email } }),
  };
};
