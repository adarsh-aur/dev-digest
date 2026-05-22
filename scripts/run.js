const fetchFeeds = require ('./fetchFeeds');
const createMarkdown = require ('./summarize');
const generateIndex = require ('./generateIndex');
const gitWorkFlow = require ('./gitWorkFlow');

async function run() {
    const articles = await fetchFeeds();

    for (const article of articles) {
        createMarkdown(article);
    }

    generateIndex("ai");
    generateIndex("development");
    generateIndex("security");
    generateIndex("technology");

    await gitWorkFlow();

    console.log("Dev Digest Updated Succesfully!")
}

run();