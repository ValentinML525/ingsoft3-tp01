'use server';
import prisma from '@/lib/prisma';

export const getUbicaciones = async () => {
	try {
		const ubicaciones = await prisma.ubicacion.findMany({});

		return ubicaciones;
	} catch (error) {
		console.log(error);
		throw new Error('Error al obtener las ubicaciones');
		return [];
	}
};
