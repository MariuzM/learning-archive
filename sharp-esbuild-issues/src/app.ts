import 'dotenv/config';

import fastify from 'fastify';

import { gradient, metadata, resize, thumbnail, toWebp } from './images';

const PORT = Number(process.env.PORT) || 3005;
const app = fastify();

app.get('/gradient', async (_req, reply) => {
  const png = await gradient(320, 200);
  reply.header('content-type', 'image/png').send(png);
});

app.post('/resize', async (req, reply) => {
  const out = await resize(req.body as Buffer, 256, 256);
  reply.header('content-type', 'image/jpeg').send(out);
});

app.post('/thumbnail', async (req, reply) => {
  const out = await thumbnail(req.body as Buffer);
  reply.header('content-type', 'image/png').send(out);
});

app.post('/webp', async (req, reply) => {
  const out = await toWebp(req.body as Buffer);
  reply.header('content-type', 'image/webp').send(out);
});

app.post('/metadata', async (req) => metadata(req.body as Buffer));

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on port:${PORT}`);
});
