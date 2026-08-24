'use server';

import prisma from '@/lib/prisma';
import { Cliente, EstadoReserva, Reserva } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from "@/auth.config";

export const insertarReserva = async (reserva: any, cliente: any) => {
	try {
		if (reserva.id) {
			const registrosActualizados = await prisma.$transaction(
				async (prisma) => {
					const clienteActualizado = await prisma.cliente.update({
						where: { id: cliente.id },
						data: {
							nombre: cliente.nombre,
							telefono: cliente.telefono,
							email: cliente.email,
						},
					});

							const pagoParcial = reserva.pagoParcial ?? 0;
							const precioTotal = reserva.precioTotal ?? 0;
							const estadoCalculado =
								pagoParcial > 0 && precioTotal > 0 && pagoParcial < precioTotal
									? EstadoReserva.PAGO_PARCIAL
									: pagoParcial > 0 && pagoParcial === precioTotal
									? EstadoReserva.PAGADA
									: reserva.estado;

							const reservaActualizada = await prisma.reserva.update({
								where: { id: reserva.id },
								data: {
									pagoParcial: reserva.pagoParcial,
									precioTotal: reserva.precioTotal,
									estado: estadoCalculado,
								},
							});
						}
					);
				} else {
					if (
						await verificarDisponibilidad(
							reserva.unidadId,
							reserva.fechaInicio,
							reserva.fechaFin
						)
					) {
						const result = await prisma.$transaction(async (prisma) => {
							const clienteCreado = await prisma.cliente.create({
								data: cliente,
							});

							const pagoParcial = reserva.pagoParcial ?? 0;
							const precioTotal = reserva.precioTotal ?? 0;
							const estadoCalculado = reserva.estado
								? reserva.estado
								: pagoParcial > 0 && precioTotal > 0 && pagoParcial < precioTotal
								? EstadoReserva.PAGO_PARCIAL
								: pagoParcial > 0 && pagoParcial === precioTotal
								? EstadoReserva.PAGADA
								: EstadoReserva.PENDIENTE;

							const reservaCreada = await prisma.reserva.create({
								data: {
									...reserva,
									clienteId: clienteCreado.id,
									estado: estadoCalculado,
								},
							});
							return reservaCreada;
						});

						return result;
					} else {
						throw new Error(
							'Existe otra reserva registrada para las fechas y unidad seleccionadas.'
						);
					}
					revalidatePath('/dashboard/reservas');
					revalidatePath('/dashboard/home');
				}
			} catch (error) {
				console.log(error);
				const msg = error instanceof Error ? error.message : String(error);
				throw new Error(`Fallo al insertar reserva: ${msg}`);
			}
		};

		export const cancelarReserva = async (idReserva: string) => {
			try {
				const reservaCancelada = await prisma.reserva.update({
					where: { id: idReserva },
					data: {
						estado: EstadoReserva.CANCELADA,
					},
				});

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

		const unidad = await prisma.unidad.findUnique({
			where: { id: unidadId },
		});
	  
		if (!unidad || !unidad.habilitada) {
			return false;
		}

		const reservaEnConflicto = await prisma.reserva.findFirst({
			where: {
				estado: {
					not: EstadoReserva.CANCELADA,
				},
				unidadId: +unidadId,
				AND: [
					{
						fechaInicio: {
							lt: fechaFin,
						},
					},
					{
						fechaFin: {
							gt: fechaInicio,
						},
					},
				],
			},
		});

		return reservaEnConflicto ? false : true;
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
}


export const getReservasCalendario = async (year: number) => {

	const session = await auth();

	try {
		const fechaInicio = new Date(`${year - 1}-12-01T00:00:00.000Z`);
		const fechaFin = new Date(`${year + 1}-01-10T23:59:59.999Z`);

		return await prisma.reserva.findMany({
			where: {
				unidad: {
					propiedad: {
						usuarioId: session?.user.id,
					},
				},
				fechaInicio: {
					gte: fechaInicio,
				},

				fechaFin: {
					lte: fechaFin,
				},
				estado: {
					not: EstadoReserva.CANCELADA,
				},
			},
			include: {
				cliente: {
					select: {
						nombre: true,
						telefono: true,
						email: true,
					},
				},
				unidad: {
					select: {
						id: true,
						nombre: true,
						propiedadId: true,
						propiedad: {
							select: {
								nombre: true, 
							},
						},
					},
				},
			},
		});
	} catch (error) {
		console.log('Error: ', error);
		throw new Error('Error al obtener las reservas de este año');
	}
};
