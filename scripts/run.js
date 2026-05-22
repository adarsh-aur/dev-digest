const fetchFeeds = require("./fetchFeeds");
const normalize = require("./normalize");
const dedupe = require("./dedupe");
const { appendArticles } = require("./writeDB");
const exportMarkdown = require("./exportMarkdown");
const generateIndex = require("./generateIndex");
const gitWorkFlow = require("./gitWorkflow");
const summarize = require("./summarize");

async function processArticles(articles) {
    const results = [];

    for (const article of articles) {

        const ai = await summarize(
            article.content,
            article.title
        );

        article.summary = ai.summary;
        article.tags = ai.tags;
        article.importance = ai.importance;
        article.why_it_matters = ai.why_it_matters;
        article.key_insights = ai.key_insights;

        results.push(article);

        // throttle Groq
        await new Promise(res => setTimeout(res, 1500));
    }

    return results;
}

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

    // AI enrichment
    const enriched = await processArticles(unique);

    let created = 0;

    // markdown export
    for (const article of enriched) {
        const fileCreated = exportMarkdown(article);
        if (fileCreated) created++;
    }

    // save DB
    appendArticles(enriched);

    // indexes
    const categories = [...new Set(enriched.map(a => a.category))];

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