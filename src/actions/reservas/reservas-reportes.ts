'use server';

import { auth } from '@/auth.config';
import { backendHeaders } from '@/lib/api-key';
import { EstadoReserva } from '@/types';

const getBackendUrl = () =>
	process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const getObjectoMeses = () =>
	Array.from({ length: 12 }, (_, i) => ({
		mes: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(
			new Date(2020, i)
		),
		total: 0,
	}));

const getObjectoEstado = () => {
	return Object.values(EstadoReserva).map((estado) => ({
		estado,
		total: 0,
	}));
};

const getByYear = async (year: number, propiedadId: number) => {
	const session = await auth();

	const params = new URLSearchParams({
		year: String(year),
		...(propiedadId ? { propiedadId: String(propiedadId) } : {}),
		...(session?.user?.id ? { usuarioId: session.user.id } : {}),
	});

	const res = await fetch(`${getBackendUrl()}/api/reservas/reportes?${params}`, {
		headers: backendHeaders(),
	});

	if (!res.ok) throw new Error('Error al obtener datos de reportes');
	return await res.json();
};

export const getMontoIngresos = async (year: number, propiedadId: number) => {
	const reservas = await getByYear(year, propiedadId);
	const meses = getObjectoMeses();
	let totalAnualIngresos = 0;

	reservas.forEach((reserva: any) => {
		const { fechaInicio, pagoParcial } = reserva;
		const mes = new Date(fechaInicio).getMonth();
		meses[mes].total += pagoParcial || 0;
		totalAnualIngresos += pagoParcial || 0;
	});

	return {
		totalIngresosAnuales: totalAnualIngresos,
		totalIngresosMensuales: meses,
	};
};

export const getDataReporteEstados = async (
	year: number,
	propiedadId: number
) => {
	const reservas = await getByYear(year, propiedadId);
	const totalEstados = getObjectoEstado();
	const meses = getObjectoMeses();

	reservas.forEach((reserva: any) => {
		const { estado, fechaInicio } = reserva;
		const contadorEstado = totalEstados.find(
			(contador) => contador.estado === estado
		);
		const mes = new Date(fechaInicio).getMonth();
		if (contadorEstado) {
			contadorEstado.total += 1;
		}
		meses[mes].total += 1;
	});

	return reservas.map((reserva: any) => ({
		estado: reserva.estado,
		total: 1,
		fechaInicio: reserva.fechaInicio,
	}));
};
