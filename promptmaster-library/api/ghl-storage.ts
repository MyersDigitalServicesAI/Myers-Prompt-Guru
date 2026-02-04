export default async function handler(req: any, res: any) {
    const ghlApiKey = process.env.GHL_API_KEY;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    const customValueId = process.env.GHL_CUSTOM_VALUE_ID; // The ID of the Custom Value used for the library

    if (!ghlApiKey || !ghlLocationId || !customValueId) {
        return res.status(500).json({ error: 'GHL Configuration missing on server' });
    }

    const BASE_URL = `https://services.leadconnectorhq.com/locations/${ghlLocationId}/custom-values/${customValueId}`;

    try {
        if (req.method === 'GET') {
            const response = await fetch(BASE_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ghlApiKey}`,
                    'Version': '2021-07-28',
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();

            // GHL returns the value in data.customValue.value
            const libraryStr = data.customValue?.value || '[]';
            return res.status(200).json({ library: JSON.parse(libraryStr) });

        } else if (req.method === 'POST') {
            const { library } = req.body;
            const libraryStr = JSON.stringify(library);

            const response = await fetch(BASE_URL, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${ghlApiKey}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Prompt Library JSON', // You can customize this
                    value: libraryStr
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update GHL Custom Value');
            }

            return res.status(200).json({ success: true });
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error: any) {
        console.error('GHL Storage Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
