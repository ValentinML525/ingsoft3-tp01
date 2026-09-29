import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkApiKey } from '@/lib/api-key';

type Params = { params: { id: string } };

/**
 * GET /api/propiedades/[id]
 * Obtiene una propiedad por id o slug.
 * Query param: ?by=slug para buscar por slug
 */
export async function GET(request: Request, { params }: Params) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const url = new URL(request.url);
		const bySlug = url.searchParams.get('by') === 'slug';

		const propiedad = bySlug
			? await prisma.propiedad.findFirst({
					where: { slug: params.id },
					include: { ubicacion: true, tipo: true },
				})
			: await prisma.propiedad.findUnique({
					where: { id: Number(params.id) },
					include: { ubicacion: true, tipo: true, unidades: true },
				});

		if (!propiedad) {
			return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
		}

		return NextResponse.json(propiedad);
	} catch (error) {
		console.error(`Error en GET /api/propiedades/${params.id}:`, error);
		return NextResponse.json({ error: 'Error al obtener la propiedad' }, { status: 500 });
	}
}

/**
 * DELETE /api/propiedades/[id]
 * Elimina una propiedad y su ubicación.
 * Query param: ?usuarioId=xxx para verificar pertenencia
 */
export async function DELETE(request: Request, { params }: Params) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const url = new URL(request.url);
		const usuarioId = url.searchParams.get('usuarioId');
		const id = Number(params.id);

		const propiedad = await prisma.propiedad.findUnique({ where: { id } });

		if (!propiedad) {
			return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
		}

		if (usuarioId && propiedad.usuarioId !== usuarioId) {
			return NextResponse.json(
				{ error: 'No tiene permisos para eliminar esta propiedad' },
				{ status: 403 }
			);
		}

		await prisma.propiedad.delete({ where: { id } });
		await prisma.ubicacion.deleteMany({ where: { id: propiedad.ubicacionId } });

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error(`Error en DELETE /api/propiedades/${params.id}:`, error);
		return NextResponse.json({ error: 'Error al eliminar la propiedad' }, { status: 500 });
	}
}
