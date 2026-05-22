const Parser = require('rss-parser');
const parser = new Parser();

const fs = require('fs');
const path = require('path');

async function fetchFeeds() {
    const feedsPath = path.join(__dirname, "../data/feeds.json");

    const feeds = JSON.parse(fs.readFileSync(feedsPath, 'utf-8'));

    let articles = [];

    for (const feed of feeds) {
        try {
            const data = await parser.parseURL(feed.url);

            const items = data.items.slice(0, 5).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                category: feed.category,

                content:
                    item.contentSnippet ||
                    item.content ||
                    item.summary ||
                    "No summary available."
            }));

            articles.push(...items);
        } catch (err) {
            console.log("Failed feed:", feed.url);
            console.log(err.message);
        }
    }
    return articles;
}

module.exports = fetchFeeds;