const fs = require('fs');
let content = fs.readFileSync('hooks/useLoanData.js', 'utf8');

const regex = /<<<<<<< HEAD[\s\S]*?=======\n([\s\S]*?)>>>>>>> origin\/main/m;

const replacement = `            if (files && files.length > 0) {
                await uploadDocuments(docRef.id, files, []);
            }
$1`;

content = content.replace(regex, replacement);

// We need to also keep the auth import
content = content.replace(
    "import { db, storage } from '@/utils/firebase';",
    "import { db, storage, auth } from '@/utils/firebase';"
);


fs.writeFileSync('hooks/useLoanData.js', content);
