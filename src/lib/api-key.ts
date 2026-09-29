import { NextResponse } from 'next/server';

/**
 * Verifica que el request tenga el header x-api-key correcto.
 * Retorna un NextResponse de error si falla, o null si es válido.
 */
export function checkApiKey(request: Request): NextResponse | null {
	const apiKey = request.headers.get('x-api-key');
	const expectedKey = process.env.BACKEND_API_KEY;

	if (!expectedKey) {
		console.error('BACKEND_API_KEY no está configurada en el backend.');
		return NextResponse.json(
			{ error: 'Server misconfiguration' },
			{ status: 500 }
		);
	}

	if (!apiKey || apiKey !== expectedKey) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	return null;
}

/**
 * Headers a incluir en los fetch del frontend al backend.
 */
export function backendHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
	return {
		'Content-Type': 'application/json',
		'x-api-key': process.env.BACKEND_API_KEY ?? '',
		...extraHeaders,
	};
}
