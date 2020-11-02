import { AzureFunction, Context } from "@azure/functions";
import * as df from "durable-functions";

const timerTrigger: AzureFunction = async function (
  context: Context,
  myTimer: any
): Promise<void> {
  const durableClient = df.getClient(context);
  const feedEntity = new df.EntityId("FeedEntity", "hn");
  await durableClient.signalEntity(feedEntity, "refresh");
};

export default timerTrigger;
