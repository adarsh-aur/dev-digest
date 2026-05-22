const fetchFeeds = require("./fetchFeeds");
const normalize = require("./normalize");
const dedupe = require("./dedupe");
const { appendArticles } = require("./writeDB");
const exportMarkdown = require("./exportMarkdown");
const generateIndex = require("./generateIndex");
const gitWorkFlow = require("./gitWorkflow");
const summarize = require("./summarize");

async function run() {

    // fetch
    const raw = await fetchFeeds();

    // normalize
    const normalized = raw.map(r =>
        normalize(r, r.category)
    );

    // dedupe
    const unique = dedupe(normalized);

    if (unique.length === 0) {
        console.log("No new articles");
        return;
    }

    // save to DB 
    appendArticles(unique);

    // markdown export
    let created = 0;

    for (const article of unique) {

        const ai = await summarize(
            article.content,
            article.title
        );

        article.summary = ai.summary;
        article.tags = ai.tags;
    }

    // indexes
    const categories = [...new Set(unique.map(a => a.category))];

    for (const c of categories) {
        generateIndex(c);
    }

    // git push
    await gitWorkFlow();

    console.log(`Dev Digest Updated (${created} new notes)`);
}

run()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });