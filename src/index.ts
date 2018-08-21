import * as dotenv from 'dotenv';
import express from 'express';
import * as path from 'path';
import RSS from 'rss';
import serveFavicon from 'serve-favicon';

dotenv.config();
/* tslint:disable-next-line:no-var-requires */
const RssParser = require('rss-parser');

const app = express();
app.use(serveFavicon(path.join(__dirname, 'public/favicon.ico')));

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

app.get('/', (_req, res) => {
  res.send(`
    <html>
      <body>
        <p>
          At <a href="/feed">/feed</a> You can find the Hacker News feed, but
          inverted such that the main link is the Hacker News comments. This
          makes it easy to share the story to Instapaper/Pocket/Wallabag.
        </p>

        <p><a href="https://github.com/spiffytech/hn-alt">Source.</a></p>
      </body>
    </html>
  `);
});

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

    res.set('Content-Type', 'application/rss+xml');
    return res.send(generator.xml());
  } catch (ex) {
    res.statusCode = 500;
    return res.send({error: ex.message});
  }
});

app.listen(process.env.PORT || 3000, () => 'Listening');