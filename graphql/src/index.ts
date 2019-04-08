import { GraphQLServer } from "graphql-yoga";

import { schema } from "./schema";

const server = new GraphQLServer({ schema });

server.start(() => console.log("Server is running on localhost:4000"));
