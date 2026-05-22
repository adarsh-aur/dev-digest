const fs = require("fs");
const path = require("path");

const seenPath = path.join(__dirname, "../data/seen.json");

function loadSeen() {
    if (!fs.existsSync(seenPath)) return [];
    return JSON.parse(fs.readFileSync(seenPath, "utf-8"));
}

function saveSeen(seen) {
    fs.writeFileSync(seenPath, JSON.stringify(seen, null, 2));
}

function dedupe(articles) {
    const seen = loadSeen();
    const set = new Set(seen);

    const unique = [];

    for (const a of articles) {
        if (set.has(a.id)) continue;

        set.add(a.id);
        seen.push(a.id);
        unique.push(a);
    }
    console.log("DEDUPE INPUT SAMPLE:", articles.slice(0, 3));  
    saveSeen(seen);
    return unique;
}

module.exports = dedupe;