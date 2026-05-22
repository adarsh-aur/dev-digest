const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../data/articles.json");

function loadDB() {
    if (!fs.existsSync(dbPath)) return [];
    return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function appendArticles(newArticles) {
    const db = loadDB();

    const merged = [...db, ...newArticles];

    saveDB(merged);

    return merged;
}

module.exports = { appendArticles };