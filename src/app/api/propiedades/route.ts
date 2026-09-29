import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkApiKey } from '@/lib/api-key';
import { generarSlug } from '@/actions/funciones-globales/funciones-globales';

/**
 * GET /api/propiedades
 * Query params: pagina, take, usuarioId (requerido para filtrar por usuario)
 */
export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const url = new URL(request.url);
		const pagina = Math.max(1, Number(url.searchParams.get('pagina') ?? '1'));
		const take = Number(url.searchParams.get('take') ?? '5');
		const usuarioId = url.searchParams.get('usuarioId') ?? undefined;
		const all = url.searchParams.get('all') === 'true';

		if (all) {
			// Devolver todas las propiedades del usuario sin paginación
			const propiedades = await prisma.propiedad.findMany({
				where: usuarioId ? { usuarioId } : undefined,
				include: {
					ubicacion: true,
					tipo: true,
					unidades: true,
				},
			});
			return NextResponse.json(propiedades);
		}

		const propiedades = await prisma.propiedad.findMany({
			where: usuarioId ? { usuarioId } : undefined,
			take,
			skip: (pagina - 1) * take,
			orderBy: { id: 'asc' },
			include: {},
		});

		const totalPropiedades = await prisma.propiedad.count({
			where: usuarioId ? { usuarioId } : undefined,
		});
		const cantidadPaginas = Math.ceil(totalPropiedades / take);

		return NextResponse.json({
			paginaActual: pagina,
			cantidadPaginas,
			totalPropiedades,
			propiedades,
		});
	} catch (error) {
		console.error('Error en GET /api/propiedades:', error);
		return NextResponse.json({ error: 'Error al obtener las propiedades' }, { status: 500 });
	}
}

/**
 * POST /api/propiedades
 * Crea o actualiza una propiedad (upsert).
 * Body: propiedad data + usuarioId
 */
export async function POST(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const propiedad = await request.json();
		const { usuarioId, ...propData } = propiedad;

		const slugPropiedad = generarSlug(propData.nombre);

		const propiedadUpserted = await prisma.propiedad.upsert({
			where: { id: propData.id || 0 },
			update: {
				nombre: propData.nombre,
				slug: slugPropiedad,
				telefonoContacto: propData.telefonoContacto,
				tipo: { connect: { id: propData.tipoPropiedadId } },
				ubicacion: {
					upsert: {
						create: {
							direccion: propData.ubicacion.direccion,
							latitud: propData.ubicacion.latitud,
							longitud: propData.ubicacion.longitud,
							ciudad: propData.ubicacion.ciudad,
							provincia: propData.ubicacion.provincia,
						},
						update: {
							direccion: propData.ubicacion.direccion,
							latitud: propData.ubicacion.latitud,
							longitud: propData.ubicacion.longitud,
							ciudad: propData.ubicacion.ciudad,
							provincia: propData.ubicacion.provincia,
						},
					},
				},
				usuario: { connect: { id: usuarioId } },
			},
			create: {
				nombre: propData.nombre,
				slug: slugPropiedad,
				telefonoContacto: propData.telefonoContacto,
				tipo: { connect: { id: propData.tipoPropiedadId } },
				ubicacion: {
					create: {
						direccion: propData.ubicacion.direccion,
						latitud: propData.ubicacion.latitud,
						longitud: propData.ubicacion.longitud,
						ciudad: propData.ubicacion.ciudad,
						provincia: propData.ubicacion.provincia,
					},
				},
				usuario: { connect: { id: usuarioId } },
			},
		});

		return NextResponse.json(propiedadUpserted);
	} catch (error) {
		console.error('Error en POST /api/propiedades:', error);
		return NextResponse.json({ error: `Error al guardar la propiedad: ${error}` }, { status: 500 });
	}
}
