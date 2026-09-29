'use server';

import { backendHeaders } from '@/lib/api-key';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface OpcionesPaginacion {
	pagina?: number;
	take?: number;
	propiedadId?: number;
}

export const getUnidadesPaginadas = async ({
	pagina = 1,
	take = 5,
}: OpcionesPaginacion) => {
	if (isNaN(Number(pagina)) || pagina < 1) pagina = 1;

	try {
		const params = new URLSearchParams({
			pagina: String(pagina),
			take: String(take),
		});

		const res = await fetch(`${getBackendUrl()}/api/unidades?${params}`, {
			headers: backendHeaders(),
		});

		if (!res.ok) throw new Error('No se pudo cargar las Unidades.');
		return await res.json();
	} catch (error) {
		throw new Error('No se pudo cargar las Unidades.');
	}
};

export const getUnidadesPaginadasPorPropiedad = async ({
	pagina = 1,
	take = 5,
	propiedadId,
}: OpcionesPaginacion) => {
	if (isNaN(Number(pagina)) || pagina < 1) pagina = 1;

	try {
		const params = new URLSearchParams({
			pagina: String(pagina),
			take: String(take),
			...(propiedadId ? { propiedadId: String(propiedadId) } : {}),
		});

		const res = await fetch(`${getBackendUrl()}/api/unidades?${params}`, {
			headers: backendHeaders(),
		});

		if (!res.ok) throw new Error(`Error al cargar unidades`);
		return await res.json();
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
};
