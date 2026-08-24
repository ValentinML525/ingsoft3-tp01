'use server';

import prisma from '@/lib/prisma';
import { NOMEM } from 'dns';
import { getSession } from 'next-auth/react';
import { auth } from "@/auth.config";

interface OpcionesPaginacion {
	pagina?: number;
	take?: number;
}

export const getPropiedadesPaginadas = async ({
	pagina = 1,
	take = 5,
}: OpcionesPaginacion) => {
	if (isNaN(Number(pagina)) || pagina < 1) pagina = 1;

  // OBTENER LA SESION DEL LADO DEL SERVIDOR
  const session = await auth();

	try {
		const propiedades = await prisma.propiedad.findMany({
      where: { usuarioId: session?.user.id},
			take,
			skip: (pagina - 1) * take,
			orderBy: { id: 'asc' },
			include: {},
		});

		const totalPropiedades = await prisma.propiedad.count({});
		const cantidadPaginas = Math.ceil(totalPropiedades / take);

		return {
			paginaActual: pagina,
			cantidadPaginas: cantidadPaginas,
			totalPropiedades: totalPropiedades,
			propiedades,
		};
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
};
