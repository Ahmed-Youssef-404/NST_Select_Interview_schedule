// api/slots.js (النسخة الفعالة والمؤمنة للتعامل مع الـ 2 Sheets المنفصلين)

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
    const ADMIN_SECRET_PASSWORD = process.env.ADMIN_SECRET_PASSWORD;

    if (!GOOGLE_SCRIPT_URL) {
        return res.status(500).json({ success: false, message: "Server misconfiguration: GOOGLE_SCRIPT_URL missing." });
    }

    // 1. طلبات الـ GET
    if (req.method === 'GET') {
        const { action, email, userId } = req.query;

        let targetUrl = `${GOOGLE_SCRIPT_URL}?action=${action}`;
        if (email) targetUrl += `&email=${encodeURIComponent(email)}`;
        if (userId) targetUrl += `&userId=${encodeURIComponent(userId)}`;

        try {
            const response = await fetch(targetUrl);
            const data = await response.json();

            // لو الـ Action كان تشيك مستخدم وطلع مش موجود، بنأكد إنه يرجع false صريحة
            if (action === 'checkUser' && data.exists === false) {
                return res.status(200).json({ exists: false });
            }

            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ success: false, message: "Google Script Connection Error" });
        }
    }

    // 2. طلبات الـ POST
    if (req.method === 'POST') {
        const body = req.body;
        const { action, password } = body;

        // تشيك الأدمن مباشرة من Vercel
        if (action === 'adminLogin') {
            if (password === ADMIN_SECRET_PASSWORD) {
                return res.status(200).json({ success: true });
            }
            return res.status(200).json({ success: false, message: "Invalid admin password." });
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ success: false, message: "Google Script Execution Error" });
        }
    }
}