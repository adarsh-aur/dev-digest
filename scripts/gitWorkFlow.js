const simpleGit = require("simple-git");
const git = simpleGit();

async function gitWorkFlow() {
    
    const status = await git.status();

    if (status.files.length === 0) {
        console.log("No new changes to commit.");
        return;
    }

    const messages = [
        "feat: Dev Digest - Add new article summaries",
        "chore: sync notes with latest articles",
        "docs: refresh index files for all the categories",
        "content: add new insights to existing summaries",
        "refractor: imporve markdown formatting for better readability"
    ];

    const msg = messages[Math.floor(Math.random() * messages.length)];

    await git.add(".");
    await git.commit(msg);
    await git.push("origin", "main");
}

module.exports = gitWorkFlow;