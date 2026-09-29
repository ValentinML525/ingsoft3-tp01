import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import { checkApiKey } from '@/lib/api-key';

export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const servicios = await prisma.servicio.findMany({
			select: { id: true, nombre: true },
		});
		return NextResponse.json(servicios);
	} catch (error) {
		return NextResponse.json({ error: 'Error al obtener los servicios' }, { status: 500 });
	}
}