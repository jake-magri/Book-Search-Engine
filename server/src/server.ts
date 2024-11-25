import express from "express";
import path from "node:path";
import db from "./config/connection.js";
import routes from "./routes/index.js";
// boilerplate code used from M18A28
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index.js";
import { authenticateToken } from './services/auth.js';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// start express app and assigns it to a variable
// set port to 3001 or use env variable
// start a new ApolloServer with an object containing typeDefs and resolvers properties.
const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// declared asyncrounous arrow function that await's the start method ran on the server
const startApolloServer = async () => {
  await server.start();

  // two middleware functions
  // this one parses incoming requests as key pair values and attaches the object to req.body
  app.use(express.urlencoded({ extended: true }));
  // this one parses incoming requests with JSON payloads
  app.use(express.json());

  app.use("/graphql", expressMiddleware(server as any,
    {
      context: authenticateToken as any
    }
  ));

  // if we're in production, serve client/dist as static assets
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
    // always serve the index.html in every response
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }
  // once the database connection is open, log to the console
  db.once("open", () => {
    app.listen(PORT, () =>
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    );
  });
  // on database error throw anh error in the console
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  // start the express server on the specified port
  app.use(routes);
};

// starts the apollo server and the express server
startApolloServer();
