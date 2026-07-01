// api/slots.js (الربط الفعلي والحقيقي مع جوجل شيت)

export default async function handler(req, res) {
    // تفعيل الـ CORS لتجنب أي مشاكل اتصال محلي أو خارجي
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
    const ADMIN_SECRET_PASSWORD = process.env.ADMIN_SECRET_PASSWORD || 'admin123';

    if (!GOOGLE_SCRIPT_URL) {
        return res.status(500).json({ success: false, message: "Server misconfiguration: Script URL missing." });
    }

    // معاملة طلبات الـ GET (جلب المواعيد، وتشيك الطالب)
    if (req.method === 'GET') {
        const { action, email, userId } = req.query;

        let targetUrl = `${GOOGLE_SCRIPT_URL}?action=${action}`;
        if (email) targetUrl += `&email=${encodeURIComponent(email)}`;
        if (userId) targetUrl += `&userId=${encodeURIComponent(userId)}`;

        try {
            const response = await fetch(targetUrl);
            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to connect with Google Sheets API." });
        }
    }

    // معاملة طلبات الـ POST (الحجز، تسجيل دخول الأدمن، إضافة وحذف المواعيد)
    if (req.method === 'POST') {
        const body = req.body;
        const { action, password } = body;

        // 1. تشيك دخول الأدمن على سيرفر فيرسيل مباشرة للأمان
        if (action === 'adminLogin') {
            if (password === ADMIN_SECRET_PASSWORD) {
                return res.status(200).json({ success: true });
            }
            return res.status(401).json({ success: false, message: "Unauthorized Admin Password." });
        }

        // 2. تمرير باقي طلبات الـ POST (الحجز، الإضافة، الحذف) لجوجل شيت
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to execute write action on Google Sheets." });
        }
    }
}