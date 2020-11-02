import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as df from "durable-functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const durableClient = df.getClient(context);
  const feedEntity = new df.EntityId("FeedEntity", "hn");
  await durableClient.signalEntity(feedEntity);

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: "Triggered feed refresh",
  };
};

export default httpTrigger;
