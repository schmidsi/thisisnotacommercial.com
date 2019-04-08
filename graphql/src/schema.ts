import * as path from "path";
import parseISO from "date-fns/fp/parseISO";
import {
  objectType,
  enumType,
  scalarType,
  makeSchema,
  queryType,
  stringArg,
  mutationType,
  arg,
  idArg
} from "nexus";

import {
  ordersCount,
  currentPrice,
  getOrderById,
  createOrder,
  updateOrder
} from "./resolvers";

const ShippingEnumType = enumType({
  name: "ShippingEnum",
  members: ["UNSTAMPED", "STANDARD", "REGISTERED"]
});

const PaymentEnumType = enumType({
  name: "PaymentEnum",
  members: ["COINBASE", "PAYPAL", "INVOICE", "STRIPE"]
});

// https://stackoverflow.com/questions/41510880/whats-the-difference-between-parsevalue-and-parseliteral-in-graphqlscalartype
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
    t.id("id");
    t.string("name");
    t.string("address");
    t.string("zip");
    t.string("location");
    t.string("country", { nullable: true });
    t.string("message", { nullable: true });
    t.date("paid", { nullable: true });
    t.field("shipping", { type: ShippingEnumType });
    t.int("price");
    t.field("payment", { type: PaymentEnumType });
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

const createOrderArgs = {
  name: stringArg(),
  address: stringArg(),
  zip: stringArg(),
  location: stringArg(),
  country: stringArg({ nullable: true, default: "Switzerland" }),
  message: stringArg({ nullable: true }),
  shipping: arg({
    type: ShippingEnumType,
    default: "UNSTAMPED" // ["ShippingEnum"].Unstamped
  })
};

const updateOrderArgs = {
  ...createOrderArgs,
  id: idArg({ required: true }),
  payment: arg({
    type: PaymentEnumType
  })
};

const Mutation = mutationType({
  definition(t) {
    t.field("createOrder", {
      type: Order,
      args: createOrderArgs,
      resolve: (_, args) => createOrder(args)
    });
    t.field("updateOrder", {
      type: Order,
      args: updateOrderArgs,
      resolve: (_, args) => updateOrder(args)
    });
  }
});

export const schema = makeSchema({
  types: {
    ShippingEnum: ShippingEnumType,
    PaymentEnum: PaymentEnumType,
    DateScalar,
    Order,
    Query,
    Mutation
  },
  outputs: {
    schema: path.join(__dirname, "./schema.graphql"),
    typegen: path.join(__dirname, "./typegen.ts")
  }
});
