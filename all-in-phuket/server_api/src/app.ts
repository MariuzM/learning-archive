import 'dotenv/config';

import cors from '@fastify/cors';
import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import Fastify from 'fastify';

import {
  addServiceListing,
  addServiceListingS,
  getData,
  getServerListings,
  getServiceListingsS,
} from './routes/init.route';
import { getOptions, getOptionsS } from './routes/options.route';
import { addCategories, addCategoriesS, addData, addDataS } from './routes/services.route';
import { initState } from './states/init.state';

// ==================================================================

(async () => {
  await initState();
})();

// ==================================================================

const app = Fastify()
  .withTypeProvider<TypeBoxTypeProvider>()
  .setValidatorCompiler(TypeBoxValidatorCompiler);

app.register(cors, {
  origin: '*',
});

app.setErrorHandler((err, req, res) => {
  const msg: string = (err.message as any).message;
  const status: number = (err.message as any).status;
  if (status && msg) {
    res.status(status).send({ message: msg });
  }
  res.status(500).send({ message: err.message });
});

// ==================================================================

app
  .get('/', () => 'Hello, Marius!')
  .get('/init', getData)

  .get('/get-options', getOptionsS, getOptions)

  .get('/get-service-listings', getServiceListingsS, getServerListings)
  .post('/add-service-listing', addServiceListingS, addServiceListing)

  .post('/add-categories', addCategoriesS, addCategories)
  .post('/add-data', addDataS, addData);

// ==================================================================

const PORT = Number(process.env.PORT) || 3000;
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on port:${PORT}`);
});
