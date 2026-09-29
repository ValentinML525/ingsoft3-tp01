'use server';

import { auth } from '@/auth.config';
import { backendHeaders } from '@/lib/api-key';
import { Propiedad, TipoPropiedad } from '@/types';
import { revalidatePath } from 'next/cache';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const getAllPropiedades = async (): Promise<Propiedad[]> => {
	const session = await auth();

	try {
		const params = new URLSearchParams({
			all: 'true',
			...(session?.user?.id ? { usuarioId: session.user.id } : {}),
		});

		const res = await fetch(`${getBackendUrl()}/api/propiedades?${params}`, {
			headers: backendHeaders(),
		});

		if (!res.ok) throw new Error('Error al obtener las propiedades');
		return await res.json() as Propiedad[];
	} catch (error) {
		throw new Error('Error al obtener las propiedades');
	}
};

export const getPropiedadPorSlug = async (slug: string): Promise<Propiedad> => {
	try {
		const res = await fetch(
			`${getBackendUrl()}/api/propiedades/${slug}?by=slug`,
			{ headers: backendHeaders() }
		);

		if (!res.ok) throw new Error('No se encontró la propiedad');

		return await res.json() as Propiedad;
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Error al obtener la propiedad.');
	}
};

export const getAllTiposPropiedad = async (): Promise<TipoPropiedad[]> => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/propiedades/tipos`, {
			headers: backendHeaders(),
		});

		if (!res.ok) throw new Error('Error al obtener los tipos de propiedad');
		return await res.json() as TipoPropiedad[];
	} catch (error) {
		throw new Error('Error al obtener los tipos de propiedad');
	}
};

export const upsertPropiedad = async (propiedad: any): Promise<Propiedad> => {
	const session = await auth();

	try {
		const res = await fetch(`${getBackendUrl()}/api/propiedades`, {
			method: 'POST',
			headers: backendHeaders(),
			body: JSON.stringify({ ...propiedad, usuarioId: session?.user?.id }),
		});

		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.error ?? 'Error al guardar la propiedad');
		}

		revalidatePath('/dashboard/propiedades');
		return await res.json() as Propiedad;
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
};

export const eliminarPropiedad = async (id: number): Promise<boolean> => {
	const session = await auth();

	try {
		const params = new URLSearchParams({
			...(session?.user?.id ? { usuarioId: session.user.id } : {}),
		});

		const res = await fetch(
			`${getBackendUrl()}/api/propiedades/${id}?${params}`,
			{
				method: 'DELETE',
				headers: backendHeaders(),
			}
		);

		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.error ?? 'Error al eliminar la propiedad');
		}

		revalidatePath('/dashboard/propiedades');
		return true;
	} catch (error) {
		throw new Error(`Error al eliminar la propiedad: ${error}`);
	}
};
