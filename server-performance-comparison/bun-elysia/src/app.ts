import { Elysia } from 'elysia';

const app = new Elysia();

const PORT = 3005;

app
  .get('/', () => {
    return {
      hello: 'world',
    };
  })
  .listen(PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
