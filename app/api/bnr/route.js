/**
 * Next.js API Route to fetch EUR/RON from BNR
 * Bypasses CORS by fetching server-side
 */

export async function GET() {
    try {
        const response = await fetch('https://www.bnr.ro/nbrfxrates.xml');

        if (!response.ok) {
            throw new Error('Failed to fetch from BNR');
        }

        const xmlText = await response.text();

        // Parse XML to extract EUR rate
        const eurMatch = xmlText.match(/<Rate currency="EUR"[^>]*>([\d.]+)<\/Rate>/);

        if (eurMatch && eurMatch[1]) {
            const eurRate = parseFloat(eurMatch[1]);
            return Response.json({
                eurRon: eurRate,
                success: true
            });
        }

        return Response.json({
            error: 'EUR rate not found in XML',
            success: false
        }, { status: 404 });

    } catch (error) {
        console.error('Error fetching EUR/RON from BNR:', error);
        return Response.json({
            error: error.message,
            success: false
        }, { status: 500 });
    }
}
