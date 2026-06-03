const fs = require('fs');
let content = fs.readFileSync('hooks/useLoanData.js', 'utf8');

content = content.replace("            if (files && files.length > 0) {\n                await uploadDocuments(docRef.id, files, []);\n            }\n", "");
content = content.replace("import { db, auth } from '@/utils/firebase';", "import { db, storage, auth } from '@/utils/firebase';\nimport { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';");

fs.writeFileSync('hooks/useLoanData.js', content);
