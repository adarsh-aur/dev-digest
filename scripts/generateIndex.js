const fs = require("fs");
const path = require("path");

function generateIndex(category) {
    const dir = path.join(__dirname, "../content", category);

    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    let output = `# ${category.toUpperCase()} INDEX\n\n`;

    for (const file of files) {
        output += `- ${file}\n`;
    }

    fs.writeFileSync(
        path.join(__dirname, `../indexes/${category}.md`),
        output,
        "utf-8"
    );
}

module.exports = generateIndex;