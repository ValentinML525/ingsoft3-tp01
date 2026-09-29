'use server';

import { backendHeaders } from '@/lib/api-key';
import { revalidatePath } from 'next/cache';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ──────────────────────────────────────────────
// GET por propiedad
// ──────────────────────────────────────────────
export const getUnidadesPorPropiedad = async (propiedadId: number) => {
	try {
		const res = await fetch(
			`${getBackendUrl()}/api/unidades/${propiedadId}?by=propiedadId`,
			{ headers: backendHeaders() }
		);
		if (!res.ok) throw new Error('Error al obtener las unidades');
		return await res.json();
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Error al obtener las unidades');
	}
};

// ──────────────────────────────────────────────
// GET todas las unidades habilitadas
// ──────────────────────────────────────────────
export const getAllUnidades = async () => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/unidades?all=true`, {
			headers: backendHeaders(),
		});
		if (!res.ok) throw new Error('Error al obtener las unidades');
		return await res.json();
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Error al obtener las unidades');
	}
};

// ──────────────────────────────────────────────
// GET unidades disponibles por ubicación
// ──────────────────────────────────────────────
export const getUnidadesDisponiblesPorUbicacion = async (
	ubicacionId: number,
	cantidadPersonas: number,
	fechaInicio: Date,
	fechaFin: Date
) => {
	try {
		const params = new URLSearchParams({
			ubicacionId: String(ubicacionId),
			cantidadPersonas: String(cantidadPersonas),
			fechaInicio: new Date(fechaInicio).toISOString(),
			fechaFin: new Date(fechaFin).toISOString(),
		});
		const res = await fetch(
			`${getBackendUrl()}/api/unidades/disponibles?${params}`,
			{ headers: backendHeaders() }
		);
		if (!res.ok) throw new Error('Error al obtener las unidades');
		return await res.json();
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Error al obtener las unidades');
	}
};

// ──────────────────────────────────────────────
// GET unidades disponibles por propiedad
// ──────────────────────────────────────────────
export const getUnidadesDisponiblesPorPropiedad = async (
	propiedadId: number,
	cantPersonas: number,
	fechaInicio: Date,
	fechaFin: Date
) => {
	try {
		const params = new URLSearchParams({
			propiedadId: String(propiedadId),
			cantidadPersonas: String(cantPersonas),
			fechaInicio: new Date(fechaInicio).toISOString(),
			fechaFin: new Date(fechaFin).toISOString(),
		});
		const res = await fetch(
			`${getBackendUrl()}/api/unidades/disponibles?${params}`,
			{ headers: backendHeaders() }
		);
		if (!res.ok) throw new Error('Error al obtener las unidades');
		return await res.json();
	} catch (error) {
		throw new Error('Error al obtener las unidades');
	}
};

// ──────────────────────────────────────────────
// GET unidad por ID
// ──────────────────────────────────────────────
export const getUnidadPorId = async (unidadId: number) => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/unidades/${unidadId}`, {
			headers: backendHeaders(),
		});
		if (!res.ok) throw new Error('Unidad no encontrada');
		return await res.json();
	} catch (error) {
		console.error('Error al obtener la unidad:', error);
		throw new Error('Error al obtener la unidad. Inténtelo de nuevo más tarde.');
	}
};

// ──────────────────────────────────────────────
// GET unidad por slug
// ──────────────────────────────────────────────
export const getUnidadPorSlug = async (slug: string) => {
	try {
		const res = await fetch(
			`${getBackendUrl()}/api/unidades/${slug}?by=slug`,
			{ headers: backendHeaders() }
		);
		if (!res.ok) throw new Error('No se encontró la unidad');
		return await res.json();
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Error al obtener la unidad.');
	}
};

// ──────────────────────────────────────────────
// GET nombre de propiedad por unidad ID
// ──────────────────────────────────────────────
export const getNombrePropiedadPorUnidadId = async (unidadId: number) => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/unidades/${unidadId}`, {
			headers: backendHeaders(),
		});
		if (!res.ok) throw new Error('No se encontró la unidad');
		const data = await res.json();
		if (!data?.propiedad?.nombre) {
			throw new Error('No se encontró la propiedad asociada.');
		}
		return data.propiedad.nombre;
	} catch (error) {
		console.error('Error al obtener el nombre de la propiedad:', error);
		throw new Error('Error al obtener el nombre de la propiedad.');
	}
};

// ──────────────────────────────────────────────
// UPSERT unidad (con soporte de imágenes base64)
// ──────────────────────────────────────────────
export const insertarUnidad = async (unidad: any) => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/unidades/${unidad.id ?? 0}`, {
			method: 'PUT',
			headers: backendHeaders(),
			body: JSON.stringify(unidad),
		});

		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.error ?? 'Error al guardar la unidad');
		}

		revalidatePath('/dashboard/propiedades/[propiedadId]/unidades');
		return await res.json();
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
};

// ──────────────────────────────────────────────
// DELETE unidad
// ──────────────────────────────────────────────
export const eliminarUnidad = async (unidad: any) => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/unidades/${unidad.id}`, {
			method: 'DELETE',
			headers: backendHeaders(),
		});
		if (!res.ok) return false;
		return true;
	} catch (error) {
		console.error('Error al borrar unidad:', error);
		return false;
	}
};

// ──────────────────────────────────────────────
// PATCH estado habilitada
// ──────────────────────────────────────────────
export const actualizarEstadoUnidad = async (
	unidadId: number,
	habilitada: boolean
) => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/unidades/${unidadId}`, {
			method: 'PATCH',
			headers: backendHeaders(),
			body: JSON.stringify({ habilitada }),
		});
		if (!res.ok) {
			console.error('Error al actualizar el estado de la unidad');
		}
	} catch (error) {
		console.error('Error al actualizar el estado de la unidad:', error);
	}
};

// ──────────────────────────────────────────────
// DELETE imagen de unidad
// ──────────────────────────────────────────────
export const EliminarImagen = async (unidadId: number, urlNombre: string) => {
	try {
		const res = await fetch(
			`${getBackendUrl()}/api/unidades/${unidadId}/imagenes`,
			{
				method: 'DELETE',
				headers: backendHeaders(),
				body: JSON.stringify({ url: urlNombre }),
			}
		);
		if (!res.ok) {
			console.error('Error al borrar imagen de la unidad');
		}
	} catch (error) {
		console.error('Error al borrar imagen de la unidad:', error);
	}
};
