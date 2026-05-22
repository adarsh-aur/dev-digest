const fs = require ('fs');
const path = require ('path');

function generateIndex(article) {
    const dir = path.join(__dirname, "../content", category);

    if(!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);

    let output = `# ${category.toUpperCase()} INDEX\n\n`;

    for (const file of files) {
        output += `- ${file}\n`;
    }

    const outPath = path.join(__dirname, `../indexes/${category}.md`);

    fs.writeFileSync(outPath, output, 'utf-8');
}

module.exports = generateIndex;