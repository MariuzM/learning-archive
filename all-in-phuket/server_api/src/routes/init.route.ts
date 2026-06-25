import { Type } from '@sinclair/typebox';
import { desc, eq } from 'drizzle-orm';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { db } from '../clients/drizzle.client';
import { services_table, ServicesE, svsTablesMap } from '../db/services.table';
import {
  AmenitiesE,
  AvailabilityTypeE,
  ContractDurationE,
  OwnershipStatusE,
  PropertyTypeE,
} from '../db/sv_real_estate.table';
import { query_get_data } from '../queries/init.query';
import { arrToObj } from '../utils/obj.util';

// ==================================================================

export async function getData(req: FastifyRequest, res: FastifyReply) {
  return await query_get_data();
}

// ==================================================================

export const getServiceListingsS = {
  schema: {
    querystring: Type.Object(
      { service: Type.Enum(arrToObj(ServicesE)) },
      { additionalProperties: false },
    ),
  },
};

export async function getServerListings(
  req: FastifyRequest<{
    Querystring: typeof getServiceListingsS.schema.querystring.static;
  }>,
  res: FastifyReply,
) {
  const service = req.query.service;
  const table = svsTablesMap[service];
  if (!table) return null;
  const data = await db.select().from(table).orderBy(desc(table.createdAt));
  return data;
}

// ==================================================================

export const addServiceListingS = {
  schema: {
    querystring: Type.Object(
      { service: Type.Enum(arrToObj(ServicesE)) },
      { additionalProperties: false },
    ),
    body: Type.Object(
      {
        name: Type.String(),
        images: Type.Array(Type.String()),
        location: Type.String(),
        price: Type.Number(),
        description: Type.String(),
        amenities: Type.Array(Type.Enum(arrToObj(AmenitiesE))),
        availabilityType: Type.Enum(arrToObj(AvailabilityTypeE)),
        contractDuration: Type.Enum(arrToObj(ContractDurationE)),
        bedroomCount: Type.Number(),
        showerCount: Type.Number(),
        ownershipStatus: Type.Enum(arrToObj(OwnershipStatusE)),
        propertyType: Type.Enum(arrToObj(PropertyTypeE)),
      },
      { additionalProperties: false },
    ),
  },
};

export async function addServiceListing(
  req: FastifyRequest<{
    Querystring: typeof addServiceListingS.schema.querystring.static;
    Body: typeof addServiceListingS.schema.body.static;
  }>,
  res: FastifyReply,
) {
  const table = svsTablesMap[req.query.service];
  if (!table) return null;

  const [s] = await db
    .select({ id: services_table.id })
    .from(services_table)
    .where(eq(services_table.name, req.query.service));

  if (!s) return null;

  console.log('🚀 ~ t1:', s.id);
  console.log('🚀 ~ req.query.service:', req.query.service);
  const data = await db
    .insert(table)
    .values({ ...req.body, serviceId: s.id })
    .returning();
  return data;
}
