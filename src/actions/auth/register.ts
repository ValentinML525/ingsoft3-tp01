'use server';

import { backendHeaders } from '@/lib/api-key';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const registerUser = async (name: string, email: string, password: string) => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/auth/register`, {
			method: 'POST',
			headers: backendHeaders(),
			body: JSON.stringify({ name, email, password }),
		});

		const data = await res.json();

		if (!res.ok) {
			return {
				ok: false,
				message: data.message ?? 'No se pudo crear el usuario',
			};
		}

		return {
			ok: true,
			user: data.user,
			message: 'Usuario creado',
		};
	} catch (error) {
		console.error('Error al registrar usuario:', error);
		return {
			ok: false,
			message: 'No se pudo conectar con el servidor. Intente más tarde.',
		};
	}
};