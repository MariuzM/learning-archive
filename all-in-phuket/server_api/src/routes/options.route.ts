import { Type } from '@sinclair/typebox';
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  amenitiesArr,
  availabilityTypeArr,
  contractDurationArr,
  ownershipStatusArr,
  propertyTypeArr,
} from '../data/sv_real_estate.data';
import type { ServicesT } from '../db/services.table';
import { ServicesE } from '../db/services.table';
import { arrToObj } from '../utils/obj.util';

const optionsMapper: Record<ServicesT, any> = {
  activities: {},
  diving: {},
  house_services: {},
  legal_visa_services: {},
  online_schooling: {},
  real_estate: {
    amenities: amenitiesArr,
    availability_type: availabilityTypeArr,
    contract_duration: contractDurationArr,
    ownership_status: ownershipStatusArr,
    property_type: propertyTypeArr,
  },
  tours: {},
  vehicles: {},
  yacht_rental: {},
};

export const getOptionsS = {
  schema: {
    querystring: Type.Object({
      service: Type.Enum(arrToObj(ServicesE)),
      // option: Type.Enum(arrToObj(Object.keys(optionsMapper['real_estate']))),
      option: Type.String(),
    }),
  },
};

export async function getOptions(
  req: FastifyRequest<{
    Querystring: typeof getOptionsS.schema.querystring.static;
  }>,
  res: FastifyReply,
) {
  if (!optionsMapper[req.query.service]) {
    throw new Error('Service not found');
  }

  if (!req.query.option || !optionsMapper[req.query.service][req.query.option]) {
    throw new Error('Option not found');
  }

  res.send(optionsMapper[req.query.service][req.query.option]);
}
