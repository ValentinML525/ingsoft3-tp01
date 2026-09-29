import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkApiKey } from '@/lib/api-key';
import { generarSlug } from '@/actions/funciones-globales/funciones-globales';
import fs from 'fs';
import path from 'path';

type Params = { params: { id: string } };

/**
 * GET /api/unidades/[id]
 * Obtiene una unidad por id o slug.
 * Query param: ?by=slug para buscar por slug | ?by=propiedadId para buscar por propiedad
 */
export async function GET(request: Request, { params }: Params) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const url = new URL(request.url);
		const by = url.searchParams.get('by');

		if (by === 'slug') {
			const unidad = await prisma.unidad.findFirst({
				where: { slug: params.id, habilitada: true },
				include: {
					propiedad: { include: { ubicacion: true } },
					imagenes: true,
					servicios: {
						include: { servicio: { select: { nombre: true, icon: true } } },
					},
				},
			});

			if (!unidad) {
				return NextResponse.json({ error: 'Unidad no encontrada' }, { status: 404 });
			}
			return NextResponse.json(unidad);
		}

		if (by === 'propiedadId') {
			const unidades = await prisma.unidad.findMany({
				where: { propiedadId: Number(params.id), habilitada: true },
				include: {
					imagenes: true,
					servicios: {
						include: { servicio: { select: { nombre: true, icon: true } } },
					},
				},
			});
			return NextResponse.json(unidades);
		}

		// Por ID numérico
		const unidad = await prisma.unidad.findUnique({
			where: { id: Number(params.id) },
			include: {
				imagenes: true,
				propiedad: { include: { ubicacion: { select: { ciudad: true } } } },
			},
		});

		if (!unidad) {
			return NextResponse.json({ error: 'Unidad no encontrada' }, { status: 404 });
		}

		return NextResponse.json(unidad);
	} catch (error) {
		console.error(`Error en GET /api/unidades/${params.id}:`, error);
		return NextResponse.json({ error: 'Error al obtener la unidad' }, { status: 500 });
	}
}

/**
 * PATCH /api/unidades/[id]
 * Actualiza el estado habilitada de una unidad.
 * Body: { habilitada: boolean }
 */
export async function PATCH(request: Request, { params }: Params) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const { habilitada } = await request.json();
		await prisma.unidad.update({
			where: { id: Number(params.id) },
			data: { habilitada },
		});
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error(`Error en PATCH /api/unidades/${params.id}:`, error);
		return NextResponse.json({ error: 'Error al actualizar el estado de la unidad' }, { status: 500 });
	}
}

/**
 * DELETE /api/unidades/[id]
 * Elimina una unidad.
 */
export async function DELETE(request: Request, { params }: Params) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		await prisma.unidad.delete({ where: { id: Number(params.id) } });
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error(`Error en DELETE /api/unidades/${params.id}:`, error);
		return NextResponse.json({ error: 'Error al eliminar la unidad' }, { status: 500 });
	}
}

/**
 * PUT /api/unidades/[id]
 * Crea o actualiza una unidad (upsert) con soporte para imágenes base64.
 */
export async function PUT(request: Request, { params }: Params) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const unidad = await request.json();
		const slugUnidad = generarSlug(unidad.nombre);
		const direccionImagen: string[] = [];

		if (unidad.imagenes && unidad.imagenes.length > 0) {
			for (const imagen of unidad.imagenes) {
				if (imagen.data) {
					// Imagen en base64
					const imagenPath = path.join(process.cwd(), 'public/imagenes', imagen.nombre);
					fs.writeFileSync(imagenPath, Buffer.from(imagen.data, 'base64'));
					direccionImagen.push('/imagenes/' + imagen.nombre);
				}
			}
		}

		const hasNewImages = direccionImagen.length > 0;

		const unidadUpserted = await prisma.unidad.upsert({
			where: { id: unidad.id || -1 },
			update: {
				nombre: unidad.nombre,
				slug: slugUnidad,
				capacidad: unidad.capacidad,
				descripcion: unidad.descripcion,
				precioPorNoche: unidad.precioPorNoche && unidad.precioPorNoche > 0 ? unidad.precioPorNoche : null,
				servicios: {
					deleteMany: {},
					create: unidad.servicios.map((servicioId: number) => ({ servicioId: +servicioId })),
				},
				...(hasNewImages && {
					imagenes: {
						deleteMany: {},
						create: direccionImagen.map((url) => ({ url })),
					},
				}),
			},
			create: {
				nombre: unidad.nombre,
				slug: slugUnidad,
				capacidad: unidad.capacidad,
				descripcion: unidad.descripcion,
				precioPorNoche: unidad.precioPorNoche && unidad.precioPorNoche > 0 ? unidad.precioPorNoche : null,
				propiedad: { connect: { id: +(unidad.propiedadId || 0) } },
				servicios: {
					create: unidad.servicios.map((servicioId: number) => ({ servicioId: +servicioId })),
				},
				...(hasNewImages && {
					imagenes: { create: direccionImagen.map((url) => ({ url })) },
				}),
			},
		});

		return NextResponse.json(unidadUpserted);
	} catch (error) {
		console.error(`Error en PUT /api/unidades/${params.id}:`, error);
		return NextResponse.json({ error: `Error al guardar la unidad: ${error}` }, { status: 500 });
	}
}
