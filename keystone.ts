import { withAuth, session } from "./auth";
import { config } from "@keystone-6/core";
import { lists } from "./schema";

export default withAuth(
  config({
    db: {
      provider: "sqlite",
      url: "file:./keystone.db",
    },
    server: {
      port: 3333,
      cors: {
        origin: ["http://localhost:8081", "https://dmk.huseyinonal.com", "https://web.dmkotofilm.com", "https://test.dmkgarage.pages.dev"],
        credentials: true,
      },
    },
    lists,
    session,
    graphql: {
      bodyParser: {
        limit: "10mb",
      },
    },
  })
);
