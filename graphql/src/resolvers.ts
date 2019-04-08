import * as R from "ramda";
import { GraphQLClient } from "graphql-request";
import { NexusGenFieldTypes } from "./typegen";

const query = `
    {
      orders {
        name
      }
    }
  `;

const endpoint =
  "https://api-euwest.graphcms.com/v1/cju5jaeou3p2o01ffx00xgf32/master";

const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.GRAPHCMS_AUTH_TOKEN}`
  }
});

const ordersCount = async (): Promise<number> => {
  // TODO: Parameterize: Only paid orders count price up
  const query = `
    {
      ordersConnection {
        aggregate {
          count
        }
      }
    }
  `;

  const result = await client.request(query);

  return R.path(["ordersConnection", "aggregate", "count"], result);
};

const compoundInterest = (initialValue, interest, iterations) =>
  initialValue * (1 + interest) ** iterations;

const currentPrice = async (): Promise<number> => {
  const orders = await ordersCount();
  return Math.round(compoundInterest(250, 0.01, orders));
};

const getOrderById = async (
  id: String
): Promise<NexusGenFieldTypes["Order"]> => {
  const query = `
    query ($id: ID) {
      order(where: {id: $id}) {
        status
        updatedAt
        createdAt
        id
        name
        address
        zip
        location
        country
        paid
        shipping
        price
        payment
      }
    }
  `;

  const result: any = await client.request(query, { id });

  return result.order;
};

export { ordersCount, currentPrice, getOrderById };

// cju6rs731bt870c155zsuug7b;
