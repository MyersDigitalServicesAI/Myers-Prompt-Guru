import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                customer_email: session.customer_details?.email
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed'
            });
        }
    } catch (error: any) {
        console.error('Stripe Verification Error:', error);
        return res.status(500).json({
            error: 'Failed to verify payment session',
            details: error.message
        });
    }
}
