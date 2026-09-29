'use server';

import { backendHeaders } from '@/lib/api-key';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth.config';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const insertarReserva = async (reserva: any, cliente: any) => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/reservas`, {
			method: 'POST',
			headers: backendHeaders(),
			body: JSON.stringify({ reserva, cliente }),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.mensaj ?? data.error ?? 'Fallo al insertar reserva');
		}

		revalidatePath('/dashboard/reservas');
		revalidatePath('/dashboard/home');
		return data;
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		throw new Error(`Fallo al insertar reserva: ${msg}`);
	}
};

export const cancelarReserva = async (idReserva: string) => {
	try {
		const res = await fetch(`${getBackendUrl()}/api/reservas`, {
			method: 'PATCH',
			headers: backendHeaders(),
			body: JSON.stringify({ id: idReserva, estado: 'CANCELADA' }),
		});

		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.error ?? 'Fallo al cancelar reserva');
		}

		return true;
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		throw new Error(`Fallo al cancelar reserva: ${msg}`);
	}
};

export async function verificarDisponibilidad(
	unidadId: number,
	fechaInicio: Date,
	fechaFin: Date
) {
	try {
		const params = new URLSearchParams({
			unidadId: String(unidadId),
			fechaInicio: fechaInicio instanceof Date ? fechaInicio.toISOString() : fechaInicio,
			fechaFin: fechaFin instanceof Date ? fechaFin.toISOString() : fechaFin,
		});

		const res = await fetch(
			`${getBackendUrl()}/api/reservas/disponibilidad?${params}`,
			{ headers: backendHeaders() }
		);

		if (!res.ok) return false;

		const data = await res.json();
		return data.disponible === true;
	} catch (error) {
		throw new Error(`Error al verificar disponibilidad: ${error}`);
	}
}

export const getReservasCalendario = async (year: number) => {
	const session = await auth();

	try {
		const params = new URLSearchParams({
			year: String(year),
			usuarioId: session?.user?.id ?? '',
		});

		const res = await fetch(
			`${getBackendUrl()}/api/reservas/calendario?${params}`,
			{ headers: backendHeaders() }
		);

		if (!res.ok) {
			throw new Error('Error al obtener las reservas del calendario');
		}

		return await res.json();
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Error al obtener las reservas de este año');
	}
};
