import * as dotenv from 'dotenv';
import express from 'express';
import RSS from 'rss';

dotenv.config();
/* tslint:disable-next-line:no-var-requires */
const RssParser = require('rss-parser');

const app = express();

if (!process.env.FEED_URL) throw new Error('Missing FEED_URL parameter');

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  comments: string | null;
  content: string;
  contentSnippet: string | null;
  isoDate: string;
}

const hnFeedUrl = 'http://news.ycombinator.com/rss';
function fetchFeed(): Promise<{items: FeedItem[]}> {
  const parser = new RssParser();
  return parser.parseURL(hnFeedUrl);
}

function invertFeedItem(item: FeedItem): FeedItem {
  return {
    ...item,
    comments: null,
    content: `<a href="${item.link}">Link</a>`,
    contentSnippet: null,
    link: item.comments || item.link,
  };
}

function feedItemToGeneratorItem(item: FeedItem) {
  return {
    date: item.pubDate,
    description: item.content,
    title: item.title,
    url: item.link,
  };
}

app.get('/feed', async (_req, res) => {
  try {
    const feedOriginal = await fetchFeed();
    const feedInverted = {...feedOriginal, items: feedOriginal.items.map(invertFeedItem)};
    const generator = new RSS({
      feed_url: process.env.FEED_URL!,
      site_url: new URL(process.env.FEED_URL!).origin,
      title: 'Hacker News Alt',
    });

    feedInverted.items.
    map(feedItemToGeneratorItem).
    forEach((item) => generator.item(item));

    return res.send(generator.xml());
  } catch (ex) {
    res.statusCode = 500;
    return res.send({error: ex.message});
  }
});

app.listen(process.env.PORT || 3000, () => 'Listening');