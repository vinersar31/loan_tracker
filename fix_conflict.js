const fs = require('fs');
let content = fs.readFileSync('hooks/useLoanData.js', 'utf8');

const replacement = `            if (files && files.length > 0) {
                await uploadDocuments(docRef.id, files, []);
            }

            const newPayment = { id: docRef.id, ...data };
            const updatedPayments = [...payments, newPayment];

            const htmlBody = \\\`
                <h2>New Payment Added</h2>
                <p>A new mortgage payment has been recorded with the following details:</p>
                <ul>
                    <li><strong>Date:</strong> \${data.date}</li>
                    <li><strong>Total Amount:</strong> \${data.amount} RON</li>
                    <li><strong>Principal:</strong> \${data.principal} RON</li>
                    <li><strong>Fees:</strong> \${data.fees || 0} RON</li>
                </ul>
                <p>Please find the updated payment history attached.</p>
            \\\`;

            await sendEmailNotification(updatedPayments, "New Mortgage Payment Added", htmlBody);`;


content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\n([\s\S]*?)>>>>>>> origin\/main/m, replacement);
content = content.replace("import { db, storage } from '@/utils/firebase';", "import { db, storage, auth } from '@/utils/firebase';");

fs.writeFileSync('hooks/useLoanData.js', content);
