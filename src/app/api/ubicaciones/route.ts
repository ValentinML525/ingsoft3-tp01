import { NextResponse } from 'next/server';
import { checkApiKey } from '@/lib/api-key';

export async function POST(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const url = await request.json();

		const response = await fetch(url.value + process.env.GEO_API_KEY, {
			method: 'GET',
		});
		const result = await response.json();

		return new NextResponse(JSON.stringify(result), {
			status: 200,
		});
	} catch (error) {
		return NextResponse.json(
			{ error: `Error al obtener las ubicaciones ${error}` },
			{ status: 500 }
		);
	}
}
