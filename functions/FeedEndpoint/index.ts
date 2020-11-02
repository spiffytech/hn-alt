import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as df from "durable-functions";
import * as RssParser from "rss-parser";
import * as RSS from "rss";

function feedItemToGeneratorItem(item: RssParser.Output) {
  return {
    date: item.pubDate,
    description: item.content,
    title: item.title,
    url: item.link,
  };
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const durableClient = df.getClient(context);
  const feedEntity = new df.EntityId("FeedEntity", "hn");
  const { entityState: feedItems } = await durableClient.readEntityState<
    RssParser.Item[]
  >(feedEntity);

  const defaultFeedUrl = "https://hn-alt.spiffy.tech/feed";
  const feedGenerator = new RSS({
    feed_url: process.env.FEED_URL || defaultFeedUrl,
    site_url: new URL(process.env.FEED_URL || defaultFeedUrl).origin,
    title: "Hacker News, Comments-Optimized",
    ttl: 5,
  });

  feedItems
    .map(feedItemToGeneratorItem)
    .forEach((item) => feedGenerator.item(item));

  context.res = {
    type: "application/rss+xml",
    body: feedGenerator.xml(),
  };
};

export default httpTrigger;
