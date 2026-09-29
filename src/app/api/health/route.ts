import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Healthcheck endpoint — usado por Docker para verificar que el backend está vivo.
 * No requiere API key.
 */
export async function GET() {
	return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
