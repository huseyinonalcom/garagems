import { withAuth, session } from "./auth";
import { config } from "@keystone-6/core";
import { lists } from "./schema";

export default withAuth(
  config({
    db: {
      provider: "sqlite",
      url: "file:./keystone.db",
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
