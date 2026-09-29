'use server';

import { backendHeaders } from '@/lib/api-key';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const getUbicaciones = async () => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/ubicaciones/todas`, {
			headers: backendHeaders(),
		});

		if (!res.ok) throw new Error('Error al obtener las ubicaciones');
		return await res.json();
	} catch (error) {
		console.error(error);
		throw new Error('Error al obtener las ubicaciones');
	}
};
