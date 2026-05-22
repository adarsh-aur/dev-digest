const fs = require("fs");
const path = require("path");

function exportMarkdown(article) {
    const folder = path.join(__dirname, "../content", article.category);

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(folder, `${article.id}.md`);

    if (fs.existsSync(filePath)) return false;

    const markdown = `# ${article.title}

## Metadata
- Category: ${article.category}
- Source: ${article.link}
- Published: ${article.pubDate}

---

## Summary

${article.content}

---

## Notes
- Add insights here
`;

    fs.writeFileSync(filePath, markdown, "utf-8");

    return true;
}

module.exports = exportMarkdown;