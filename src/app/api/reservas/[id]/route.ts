import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { checkApiKey } from '@/lib/api-key';

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	const reserva = await prisma.reserva.findFirst({
		where: { id: params.id },
	});

	if (!reserva) {
		return NextResponse.json({
			message: `No se encontró la reserva con id ${params.id}`,
		});
	}
	return NextResponse.json(reserva);
}
