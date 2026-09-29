import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkApiKey } from '@/lib/api-key';

type Params = { params: { id: string } };

/**
 * DELETE /api/unidades/[id]/imagenes
 * Elimina una imagen de una unidad por URL.
 * Body: { url: string }
 */
export async function DELETE(request: Request, { params }: Params) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const { url } = await request.json();

		await prisma.imagen.deleteMany({
			where: {
				unidadId: Number(params.id),
				url,
			},
		});

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error(`Error en DELETE /api/unidades/${params.id}/imagenes:`, error);
		return NextResponse.json({ error: 'Error al borrar imagen de la unidad' }, { status: 500 });
	}
}
