export function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

export function isValidFirebaseUrl(urlStr) {
    if (!urlStr) return false;
    try {
        const parsedUrl = new URL(urlStr);
        return parsedUrl.protocol === 'https:' && parsedUrl.hostname === 'firebasestorage.googleapis.com';
    } catch (e) {
        return false;
    }
}
