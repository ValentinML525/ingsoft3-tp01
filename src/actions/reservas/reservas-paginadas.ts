'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth.config';

interface OpcionesPaginacion {
    pagina?: number;
    take?: number;
    propiedadId?: number;
}

export const getReservasPaginadas = async ({
    pagina = 1,
    take = 5,
    propiedadId,
}: OpcionesPaginacion) => {
    if (isNaN(Number(pagina)) || pagina < 1) pagina = 1;

    // OBTENER LA SESION DEL LADO DEL SERVIDOR
    const session = await auth();

    try {
        const reservas = await prisma.reserva.findMany({
            where: {
                unidad: {
                    propiedad: {
                        id: propiedadId,
                        usuarioId: session?.user.id,
                    },
                },
            },
            take,
            skip: (pagina - 1) * take,
            include: {
                cliente: {
                    select: {
                        nombre: true,
                        telefono: true,
                        email: true,
                    },
                },
                unidad: {
                    select: {
                        nombre: true,
                    },
                },
            },
            orderBy: { fechaHoraCreacion: 'desc' },
        });

        const totalReservas = await prisma.reserva.count({
            where: {
                unidad: {
                    propiedad: {
                        id: propiedadId,
                        usuarioId: session?.user.id,
                    },
                },
            },
        });
        const cantidadPaginas = Math.ceil(totalReservas / take);

        return {
            paginaActual: pagina,
            cantidadPaginas: cantidadPaginas,
            totalReservas: totalReservas,
            reservas,
        };
    } catch (error) {
        throw new Error(`Error: ${error}`);
    }
};
