import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health/db
 * Comprueba que el backend llega a SU base y que el esquema existe (cuenta filas de una tabla
 * real, no un SELECT 1). Lo usa el smoke test: un /api/health que no toca la BD daría verde
 * con la connection string rota o con la base sin migrar.
 * No requiere API key: no devuelve datos, sólo un conteo.
 */
export async function GET() {
	try {
		const servicios = await prisma.servicio.count();
		return NextResponse.json({ status: 'ok', db: 'ok', servicios });
	} catch (error) {
		console.error('Error en GET /api/health/db:', error);
		return NextResponse.json({ status: 'error', db: 'sin conexión o sin esquema' }, { status: 503 });
	}
}
