'use server';

import { auth } from '@/auth.config';
import { backendHeaders } from '@/lib/api-key';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface OpcionesPaginacion {
	pagina?: number;
	take?: number;
}

export const getPropiedadesPaginadas = async ({
	pagina = 1,
	take = 5,
}: OpcionesPaginacion) => {
	if (isNaN(Number(pagina)) || pagina < 1) pagina = 1;

	const session = await auth();

	try {
		const params = new URLSearchParams({
			pagina: String(pagina),
			take: String(take),
			...(session?.user?.id ? { usuarioId: session.user.id } : {}),
		});

		const res = await fetch(`${getBackendUrl()}/api/propiedades?${params}`, {
			headers: backendHeaders(),
		});

		if (!res.ok) throw new Error('Error al obtener las propiedades');
		return await res.json();
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
};
