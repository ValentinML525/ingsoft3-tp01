'use server';
import prisma from '@/lib/prisma';

export const getAllServicios = async () => {
	try {
		const servicios = await prisma.servicio.findMany({});

		return servicios;
	} catch (error) {
		console.log(error);
		throw new Error('Error al buscar los servicios');
		return [];
	}
};
