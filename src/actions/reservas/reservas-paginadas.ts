'use server';

import { auth } from '@/auth.config';
import { backendHeaders } from '@/lib/api-key';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

	const session = await auth();

	try {
		const params = new URLSearchParams({
			pagina: String(pagina),
			take: String(take),
			...(propiedadId ? { propiedadId: String(propiedadId) } : {}),
			...(session?.user?.id ? { usuarioId: session.user.id } : {}),
		});

		const res = await fetch(`${getBackendUrl()}/api/reservas?${params}`, {
			headers: backendHeaders(),
		});

		if (!res.ok) throw new Error('Error al cargar reservas');

		const data = await res.json();
		// El backend retorna { reservas: { reservas, ... } }
		return data.reservas ?? data;
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
};
