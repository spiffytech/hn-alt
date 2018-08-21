The Hacker News RSS feed, but inverted such that the main link is the HN comments link. Makes it easy to share the item from your RSS Reader into Instapaper/Pocket/Wallabag.

MIT licensed.

# Building
`npm install`
`tsc`
`cp -r public/ dist/`
`node dist/index.js`

Or run it with Docker

# Configuring
Configured via environment variables, or a .env file.

`FEED_URL=https://hn-alt.spiffy.tech`