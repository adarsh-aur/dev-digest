const fs = require ('fs');
const path = require ('path');
const slugify = require ('slugify');

function createMarkdown(article) {
    const slug = slugify(article.title, { lower: true, strict: true });

    const folder = path.join(__dirname, "../content", article.category);

    if(!fs.existsSync(foler)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    const filepath = path.join(folder, `${slug}.md`);

    const markdown = `# ${article.title}

    Category: ${article.category}

    Published on: ${article.pubDate}

    Source: ${article.link}

    ## Summary
    Auto generated summary goes here.

    ## Notes
    - Add insisghtful notes here.
    `;

    fs.writeFileSync(filepath, markdown, 'utf-8');
}

module.exports = createMarkdown;