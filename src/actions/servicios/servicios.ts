'use server';

import { backendHeaders } from '@/lib/api-key';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const getAllServicios = async () => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/servicios`, {
			headers: backendHeaders(),
		});

		if (!res.ok) throw new Error('Error al buscar los servicios');
		return await res.json();
	} catch (error) {
		console.error(error);
		throw new Error('Error al buscar los servicios');
	}
};
