/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */

import * as df from "durable-functions";
import * as RssParser from "rss-parser";

const hnFeedUrl = "http://news.ycombinator.com/rss";
function fetchFeed() {
  const parser = new RssParser();
  return parser.parseURL(hnFeedUrl);
}

function invertFeedItem(item: RssParser.Item): RssParser.Item {
  return {
    ...item,
    comments: null,
    content: `<a href="${item.link}">${item.link}</a>`,
    contentSnippet: null,
    link: item.comments || item.link,
  };
}

export default df.entity(async function (context) {
  switch (context.df.operationName) {
    case "refresh":
      const state = context.df.getState(() => []) as RssParser.Item[];
      const liveRssFeed = await fetchFeed();
      const invertedLiveItems = liveRssFeed.items.map(invertFeedItem);
      const allItemsSorted = [...state, ...invertedLiveItems].sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        if (dateA === dateB) return 0;
        return dateA < dateB ? 1 : -1;
      });
      const dedupedItems: RssParser.Item[] = [];
      for (const item of allItemsSorted) {
        if (
          !dedupedItems.some(
            (itemUnderTest) => item.link === itemUnderTest.link
          )
        ) {
          dedupedItems.push(item);
        }
      }
      const newState = dedupedItems.slice(0, 200);
      context.df.setState(newState);
      break;
  }
});
