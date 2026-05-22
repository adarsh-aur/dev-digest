const fetchFeeds = require("./fetchFeeds");
const createMarkdown = require("./summarize");
const generateIndex = require("./generateIndex");
const gitWorkFlow = require("./gitWorkFlow");

async function run() {
    const articles = await fetchFeeds();

    let createdCount = 0;

    // markdown files
    for (const article of articles) {
        const created = createMarkdown(article);
        if (created) createdCount++;
    }

    // dynamic category list
    const categories = [
        ...new Set(articles.map(a => a.category))
    ];

    for (const category of categories) {
        generateIndex(category);
    }

    // commit if change
    if (createdCount > 0) {
        await gitWorkFlow();
        console.log(`Dev Digest Updated Successfully! (${createdCount} new notes)`);
    } else {
        console.log("No new content found — skipping commit.");
    }
}

run()
    .then(() => {
        console.log("Process finished ✅");
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });