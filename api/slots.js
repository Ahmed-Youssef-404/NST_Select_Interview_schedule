// api/slots.js
export default async function handler(req, res) {
    const SCRIPT_URL = process.env.APPS_SCRIPT_URL;

    // إعداد الـ CORS headers لمنع أي مشاكل
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 1. التعامل مع طلب الـ GET (جلب المواعيد أو تشيك على يوزر)
        if (req.method === 'GET') {
            const { action, email, userId } = req.query;

            let targetUrl = `${SCRIPT_URL}?action=${action}`;
            if (email && userId) {
                targetUrl += `&email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`;
            }

            const response = await fetch(targetUrl);
            const data = await response.json();
            return res.status(200).json(data);
        }

        // 2. التعامل مع طلب الـ POST (حجز ميعاد)
        if (req.method === 'POST') {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body)
            });
            const data = await response.json();
            return res.status(200).json(data);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}