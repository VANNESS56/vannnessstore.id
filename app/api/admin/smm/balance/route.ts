import { NextResponse } from 'next/server';
import { buzzerpanel } from '@/lib/buzzerpanel';

export async function GET() {
    try {
        const response = await buzzerpanel.getProfile();

        if (!response.status) {
            return NextResponse.json({ error: response.data?.msg || 'Failed to fetch profile' }, { status: 500 });
        }

        return NextResponse.json({
            username: response.data.username,
            balance: response.data.balance,
            currency: response.data.currency || 'IDR'
        });
    } catch (error: any) {
        console.error('Buzzerpanel Profile Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
