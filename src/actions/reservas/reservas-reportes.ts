'use server';
import prisma from '@/lib/prisma';
import { EstadoReserva } from '@prisma/client';
import { auth } from '@/auth.config';

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

    return await prisma.reserva.findMany({
        where: {
            unidad: {
                propiedad: {
                    id: propiedadId,
                    usuarioId: session?.user.id,
                },
            },
            fechaInicio: {
                gte: new Date(`${year}-01-01T00:00:00.000Z`),
            },
            fechaFin: {
                lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
            },
        },
    });
};

export const getMontoIngresos = async (year: number, propiedadId: number) => {
    const reservas = await getByYear(year, propiedadId);
    const meses = getObjectoMeses();
    let totalAnualIngresos = 0;

    reservas.forEach((reserva) => {
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

    reservas.forEach((reserva) => {
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

    return reservas.map((reserva) => ({
        estado: reserva.estado,
        total: 1, // Número de reservas
        fechaInicio: reserva.fechaInicio, // Para calcular el mes
    }));
};
