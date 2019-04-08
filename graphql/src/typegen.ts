/**
 * This file was automatically generated by Nexus 0.11.6
 * Do not make changes to this file directly
 */


import { core } from "nexus"
declare global {
  interface NexusGenCustomDefinitionMethods<TypeName extends string> {
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "Date";
  }
}

declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
}

export interface NexusGenEnums {
  PaymentEnum: "COINBASE" | "INVOICE" | "PAYPAL" | "STRIPE"
  ShippingEnum: "REGISTERED" | "STANDARD" | "UNSTAMPED"
}

export interface NexusGenRootTypes {
  Mutation: {};
  Order: { // root type
    address: string; // String!
    country?: string | null; // String
    id: string; // ID!
    location: string; // String!
    message?: string | null; // String
    name: string; // String!
    paid?: any | null; // Date
    payment: NexusGenEnums['PaymentEnum']; // PaymentEnum!
    price: number; // Int!
    shipping: NexusGenEnums['ShippingEnum']; // ShippingEnum!
    zip: string; // String!
  }
  Query: {};
  String: string;
  Int: number;
  Float: number;
  Boolean: boolean;
  ID: string;
  Date: any;
}

export interface NexusGenAllTypes extends NexusGenRootTypes {
  PaymentEnum: NexusGenEnums['PaymentEnum'];
  ShippingEnum: NexusGenEnums['ShippingEnum'];
}

export interface NexusGenFieldTypes {
  Mutation: { // field return type
    createOrder: NexusGenRootTypes['Order']; // Order!
    updateOrder: NexusGenRootTypes['Order']; // Order!
  }
  Order: { // field return type
    address: string; // String!
    country: string | null; // String
    id: string; // ID!
    location: string; // String!
    message: string | null; // String
    name: string; // String!
    paid: any | null; // Date
    payment: NexusGenEnums['PaymentEnum']; // PaymentEnum!
    price: number; // Int!
    shipping: NexusGenEnums['ShippingEnum']; // ShippingEnum!
    zip: string; // String!
  }
  Query: { // field return type
    currentPrice: number; // Int!
    order: NexusGenRootTypes['Order']; // Order!
    ordersCount: number; // Int!
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createOrder: { // args
      address?: string | null; // String
      country?: string | null; // String
      location?: string | null; // String
      message?: string | null; // String
      name?: string | null; // String
      shipping?: NexusGenEnums['ShippingEnum'] | null; // ShippingEnum
      zip?: string | null; // String
    }
    updateOrder: { // args
      address?: string | null; // String
      country?: string | null; // String
      id: string; // ID!
      location?: string | null; // String
      message?: string | null; // String
      name?: string | null; // String
      payment?: NexusGenEnums['PaymentEnum'] | null; // PaymentEnum
      shipping?: NexusGenEnums['ShippingEnum'] | null; // ShippingEnum
      zip?: string | null; // String
    }
  }
  Query: {
    order: { // args
      id: string; // String!
    }
  }
}

export interface NexusGenAbstractResolveReturnTypes {
}

export interface NexusGenInheritedFields {}

export type NexusGenObjectNames = "Mutation" | "Order" | "Query";

export type NexusGenInputNames = never;

export type NexusGenEnumNames = "PaymentEnum" | "ShippingEnum";

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = "Boolean" | "Date" | "Float" | "ID" | "Int" | "String";

export type NexusGenUnionNames = never;

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  allTypes: NexusGenAllTypes;
  inheritedFields: NexusGenInheritedFields;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractResolveReturn: NexusGenAbstractResolveReturnTypes;
}