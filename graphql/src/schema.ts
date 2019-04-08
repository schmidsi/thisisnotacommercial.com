import * as path from "path";
import parseISO from "date-fns/fp/parseISO";
import {
  objectType,
  enumType,
  scalarType,
  makeSchema,
  queryType,
  stringArg
} from "nexus";

import { ordersCount, currentPrice, getOrderById } from "./resolvers";

const ShippingEnum = enumType({
  name: "ShippingEnum",
  members: ["Unstamped", "Standard", "Registered"]
});

const PaymentEnum = enumType({
  name: "PaymentEnum",
  members: ["Coinbase", "Paypal", "Invoce", "Stripe"]
});

const DateScalar = scalarType({
  name: "Date",
  asNexusMethod: "date",
  description: "Date custom scalar type",
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    const dateObj = parseISO(value);
    return dateObj.getTime();
  },
  parseLiteral(ast) {
    if (ast.kind === "IntValue") {
      return new Date(ast.value);
    }
    return null;
  }
});

const Order = objectType({
  name: "Order",
  definition(t) {
    t.string("name");
    t.string("address");
    t.string("zip");
    t.string("location");
    t.string("country", { nullable: true });
    t.date("paid", { nullable: true });
    t.field("shipping", { type: ShippingEnum });
    t.int("price");
    t.field("payment", { type: PaymentEnum });
  }
});

const Query = queryType({
  definition(t) {
    t.field("ordersCount", {
      type: "Int",
      resolve: ordersCount
    });
    t.field("currentPrice", {
      type: "Int",
      resolve: currentPrice
    });
    t.field("order", {
      type: Order,
      args: {
        id: stringArg({
          required: true
        })
      },
      resolve: (_, { id }) => getOrderById(id)
    });
  }
});

export const schema = makeSchema({
  types: { ShippingEnum, PaymentEnum, DateScalar, Order, Query },
  outputs: {
    schema: path.join(__dirname, "./schema.graphql"),
    typegen: path.join(__dirname, "./typegen.d.ts")
  }
});
