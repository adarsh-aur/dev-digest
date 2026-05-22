const fetchFeeds = require ('./fetchFeeds');
const createMarkdown = require ('./summarize');
const generateIndex = require ('./generateIndex');
const gitWorkFlow = require ('./gitWorkFlow');

async function run() {
    const articles = await fetchFeeds();

    for (const article of articles) {
        createMarkdown(article);
    }

    const categories = [...new Set(
        articles.map(article => article.category)
      )];
      
      for (const category of categories) {
        generateIndex(category);
      }

    await gitWorkFlow();

    console.log("Dev Digest Updated Succesfully!")
}

run();