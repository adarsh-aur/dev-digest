const crypto = require("crypto");

function normalizeArticle(item, category) {
    const id = crypto
        .createHash("md5")
        .update(item.link || item.title)
        .digest("hex");

    return {
        id,
        title: item.title,
        link: item.link,
        category,
        pubDate: item.pubDate,
        content:
            item.contentSnippet ||
            item.content ||
            item.summary ||
            "No summary available.",
        createdAt: new Date().toISOString()
    };
}

module.exports = normalizeArticle;