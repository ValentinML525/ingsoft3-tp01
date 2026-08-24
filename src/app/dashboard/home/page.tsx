'use client';

import { Calendario } from '@/components/Calendario/Calendario';
import { Reserva } from '@prisma/client';
import { getReservasCalendario } from '@/actions/reservas/reservas';
import { getAllPropiedades } from '@/actions/propiedades/propiedades';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const colorPalette = [
    {
        bg: 'rgba(255, 99, 132, 0.7)',
        border: 'rgb(255, 99, 132)',
        text: 'rgb(255, 255, 255)',
    },
    {
        bg: 'rgba(54, 162, 235, 0.7)',
        border: 'rgb(54, 162, 235)',
        text: 'rgb(255, 255, 255)',
    },
    {
        bg: 'rgba(255, 206, 86, 0.7)',
        border: 'rgb(255, 206, 86)',
        text: 'rgb(0, 0, 0)',
    },
    {
        bg: 'rgba(75, 192, 192, 0.7)',
        border: 'rgb(75, 192, 192)',
        text: 'rgb(255, 255, 255)',
    },
    {
        bg: 'rgba(153, 102, 255, 0.7)',
        border: 'rgb(153, 102, 255)',
        text: 'rgb(255, 255, 255)',
    },
    {
        bg: 'rgba(255, 159, 64, 0.7)',
        border: 'rgb(255, 159, 64)',
        text: 'rgb(0, 0, 0)',
    },
    {
        bg: 'rgba(52, 73, 94, 0.7)',
        border: 'rgb(52, 73, 94)',
        text: 'rgb(255, 255, 255)',
    },
    {
        bg: 'rgba(231, 76, 60, 0.7)',
        border: 'rgb(231, 76, 60)',
        text: 'rgb(255, 255, 255)',
    },
    {
        bg: 'rgba(46, 204, 113, 0.7)',
        border: 'rgb(46, 204, 113)',
        text: 'rgb(255, 255, 255)',
    },
    {
        bg: 'rgba(155, 89, 182, 0.7)',
        border: 'rgb(155, 89, 182)',
        text: 'rgb(255, 255, 255)',
    },
];

const reservasAEventos = (reservas: any[]) => {
    const unidadColors = new Map();
    let colorIndex = 0;

    return reservas.map((reserva) => {
        if (!unidadColors.has(reserva.unidad.nombre)) {
            unidadColors.set(
                reserva.unidad.nombre,
                colorPalette[colorIndex % colorPalette.length]
            );
            colorIndex++;
        }
        const color = unidadColors.get(reserva.unidad.nombre);

        const fechaFinReserva = new Date(reserva.fechaFin);
        const fechaFinParaEvento = new Date(fechaFinReserva);
        fechaFinParaEvento.setDate(fechaFinParaEvento.getDate() + 1);

        return {
            title: `${reserva.cliente.nombre} - ${reserva.cantidadPersonas} personas`,
            start: reserva.fechaInicio,
            end: fechaFinParaEvento,
            backgroundColor: color.bg,
            borderColor: color.border,
            textColor: color.text,
            extendedProps: {
                id: reserva.id,
                unidad: reserva.unidad.nombre,
                fechaInicio: reserva.fechaInicio,
                fechaFin: reserva.fechaFin,
                cantidadPersonas: reserva.cantidadPersonas,
                precioTotal: reserva.precioTotal,
                estado: reserva.estado,
                pagoParcial: reserva.pagoParcial,
                observaciones: reserva.observaciones,
                unidadId: reserva.unidadId,
                clienteId: reserva.clienteId,
                cliente: reserva.cliente,
                propiedadId: reserva.unidad.propiedadId,
                propiedadNombre: reserva.unidad.propiedad.nombre,
            },
        };
    });
};

export default function DashboardHome() {
    const [eventosCalendario, setEventosCalendario] = useState<any[]>([]);
    const [propiedades, setPropiedades] = useState<
        { id: number; nombre: string }[]
    >([]);
    const [activeTab, setActiveTab] = useState<number | null>(null);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const cargarPropiedades = async () => {
            try {
                const propiedadesExistentes = await getAllPropiedades();
                const propiedadesUnicas = propiedadesExistentes.map(
                    (propiedad) => ({
                        id: propiedad.id,
                        nombre: propiedad.nombre,
                    })
                );

                setPropiedades(propiedadesUnicas);
                if (propiedadesUnicas.length > 0)
                    setActiveTab(propiedadesUnicas[0].id);
            } catch (error) {
                console.error('Error al cargar propiedades:', error);
            } finally {
                setIsLoading(false);
            }
        };

        cargarPropiedades();
    }, []);

    useEffect(() => {
        const cargarReservas = async (year: number) => {
            try {
                const reservasCalendario = await getReservasCalendario(year);
                const eventos = reservasAEventos(reservasCalendario);
                setEventosCalendario(eventos);
            } catch (error) {
                console.error('Error al cargar reservas:', error);
            }
        };

        cargarReservas(currentYear);
    }, [currentYear]);

    const handleYearChange = (newYear: number) => {
        if (newYear !== currentYear) {
            setCurrentYear(newYear);
        }
    };

    const refrescar = () => {
        window.location.reload();
        router.refresh();
    };

    const eventosPorPropiedad = (propiedadId: number) =>
        eventosCalendario.filter(
            (evento) => evento.extendedProps.propiedadId === propiedadId
        );

    return (
        <div>
            <h1 className='text-3xl font-bold mb-6 text-left bg-light-green-600 text-white py-2 px-4 rounded shadow-lg'>
                Calendario de Reservas
            </h1>
            {isLoading ? (
                <div className='text-center text-xl font-bold py-6'>
                    Cargando...
                </div>
            ) : (
                <>
                    <div
                        style={{
                            display: 'flex',
                            borderBottom: '2px solid #ccc',
                        }}
                    >
                        {propiedades.length > 0 ? (
                            propiedades.map(({ id, nombre }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    style={{
                                        padding: '10px 20px',
                                        cursor: 'pointer',
                                        borderBottom:
                                            activeTab === id
                                                ? '2px solid #a3e635'
                                                : 'none',
                                        backgroundColor:
                                            activeTab === id
                                                ? '#f0f8ff'
                                                : 'transparent',
                                    }}
                                >
                                    {nombre}
                                </button>
                            ))
                        ) : (
                            <div style={{ padding: '10px 20px' }}>
                                No hay propiedades disponibles
                            </div>
                        )}
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <Calendario
                            eventos={
                                activeTab ? eventosPorPropiedad(activeTab) : []
                            }
                            onYearChange={handleYearChange}
                            refrescar={refrescar}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
