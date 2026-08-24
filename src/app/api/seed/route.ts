export const dynamic = 'force-dynamic';

import prisma from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import { initialData, clientesConReservasArray } from '../../../seed/data/seed.data';
import bcryptjs from 'bcryptjs';
import { Role } from '@prisma/client';
import { generarSlug } from '@/actions/funciones-globales/funciones-globales';
import { insertarReserva } from '@/actions/reservas/reservas';

export async function GET(request: Request) {
	await prisma.$executeRaw`ALTER SEQUENCE "Servicio_id_seq" RESTART WITH 1`;
	await prisma.$executeRaw`ALTER SEQUENCE "Unidad_id_seq" RESTART WITH 1`;
	await prisma.$executeRaw`ALTER SEQUENCE "Cliente_id_seq" RESTART WITH 1`;
	await prisma.$executeRaw`ALTER SEQUENCE "TipoPropiedad_id_seq" RESTART WITH 1`;
	await prisma.$executeRaw`ALTER SEQUENCE "Propiedad_id_seq" RESTART WITH 1`;
	await prisma.$executeRaw`ALTER SEQUENCE "Ubicacion_id_seq" RESTART WITH 1`;

	await prisma.serviciosXUnidad.deleteMany({});
	await prisma.servicio.deleteMany({});
	await prisma.imagen.deleteMany({});
	await prisma.reserva.deleteMany({});
	await prisma.unidad.deleteMany({});
	await prisma.cliente.deleteMany({});
	await prisma.propiedad.deleteMany({});
	await prisma.tipoPropiedad.deleteMany({});
	await prisma.ubicacion.deleteMany({});
	await prisma.user.deleteMany({});

	const ubicaciones = await prisma.ubicacion.createMany({
		data: [...initialData.ubicaciones],
	});

	const tiposPropiedad = await prisma.tipoPropiedad.createMany({
		data: [...initialData.tiposPropiedad],
	});

	const user1 = await prisma.user.create({
		data: {
			email: 'pbonetto@gmail.com',
			name: 'Patricio Bonetto',
			password: bcryptjs.hashSync('123456'),
			role: Role.Propietario,
			propiedades: {
				create: [
					{
						nombre: 'Alto las flores',
						ubicacionId: 1,
						tipoPropiedadId: 2,
						telefonoContacto: '3517642289',
						slug: 'alto-las-flores',
					},
				],
			},
		},
	});

	const user2 = await prisma.user.create({
		data: {
			email: 'mmarochi@gmail.com',
			name: 'Marcelo Marochi',
			password: bcryptjs.hashSync('123456'),
			role: Role.Propietario,
			propiedades: {
				create: [
					{
						nombre: 'El Descanso',
						ubicacionId: 2,
						tipoPropiedadId: 2,
						telefonoContacto: '3517660421',
						slug: 'el-descanso',
					},
					{
						nombre: 'Claros del Bosque',
						ubicacionId: 3,
						tipoPropiedadId: 2,
						telefonoContacto: '3517660421',
						slug: 'claros-del-bosque',
					},
				],
			},
		},
	});

	const propiedadesBuscadas = await prisma.unidad.findMany({});

	const serviciosCreado = await prisma.servicio.createMany({
		data: [...initialData.servicios],
	});

	for (const unidad of initialData.unidades) {
		const slugUnidad = generarSlug(unidad.nombre);
		await prisma.unidad.create({
			data: {
				nombre: unidad.nombre,
				slug: slugUnidad,
				capacidad: unidad.capacidad,
				descripcion: unidad.descripcion,
				precioPorNoche: unidad.precioPorNoche,
				imagenes: unidad.imagenes,
				propiedadId: unidad.propiedadId,
				servicios: {
					create: unidad.servicios.create.map((servicio) => ({
						servicio: {
							connect: {
								id: servicio.servicio.connect.id,
							},
						},
					})),
				},
			},
		});
	}
	
	for (const clienteConReserva of clientesConReservasArray) {
		console.log(clienteConReserva);
		const { reserva, cliente } = clienteConReserva;
		await insertarReserva(reserva, cliente);
	}

	return NextResponse.json('Seed ejecutado');
}
