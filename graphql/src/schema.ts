import * as path from "path";
import { objectType, enumType, scalarType, makeSchema } from "nexus";

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
    return value.getTime();
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
    t.string("Name");
    t.string("Address");
    t.string("ZIP");
    t.string("Location");
    t.string("Country", { nullable: true });
    t.date("Paid", { nullable: true });
    t.field("Shipping", { type: ShippingEnum });
    t.int("Price");
    t.field("Payment", { type: PaymentEnum });
  }
});

export const schema = makeSchema({
  types: { ShippingEnum, PaymentEnum, DateScalar, Order },
  outputs: {
    schema: path.join(__dirname, "./schema.graphql"),
    typegen: path.join(__dirname, "./typegen.ts")
  }
});
