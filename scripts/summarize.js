const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

function createMarkdown(article) {
    const slug = slugify(article.title, {
        lower: true,
        strict: true
    });

    const folder = path.join(
        __dirname,
        "../content",
        article.category
    );

    // ensure folder exists
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(folder, `${slug}.md`);

    // prevent overwriting 
    if (fs.existsSync(filePath)) {
        return false;
    }

    const markdown = `# ${article.title}

Category: ${article.category}

Published: ${article.pubDate}

Source: ${article.link}

---

## Summary

${article.content || "No summary available."}

---

## Notes
- Add insightful notes here
`;

    fs.writeFileSync(filePath, markdown, "utf-8");

    return true;
}

module.exports = createMarkdown;