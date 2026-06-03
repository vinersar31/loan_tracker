const fs = require('fs');
let content = fs.readFileSync('hooks/useLoanData.js', 'utf8');

content = content.replace("const htmlBody = \\`", "const htmlBody = `");
content = content.replace("            \\`;", "            `;");

fs.writeFileSync('hooks/useLoanData.js', content);
