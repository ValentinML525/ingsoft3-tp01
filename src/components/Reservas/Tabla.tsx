'use client';

import { EstadoReserva } from '@prisma/client';
import { BiEnvelope } from 'react-icons/bi';
import { BsWhatsapp } from 'react-icons/bs';
import { Paginacion } from '../../app/commons/Paginacion';
import { useState, useEffect } from 'react';
import { ChangeEvent } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { getReservasPaginadas } from '@/actions/reservas/reservas-paginadas';
import { useRouter } from 'next/navigation';
import { FaPencilAlt } from 'react-icons/fa';
import { Button, Tooltip } from '@/components/Client/MaterialTailwindClient';
import { FormReserva } from './FormReserva';


interface Props {
    propiedadId: number;
}

export const Tabla = ({ propiedadId }: Props) => {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
	const [reservaSeleccionada, setReservaSeleccionada] = useState<any>();
    const [reservas, setReservas] = useState<any[]>([]);
    const [cantidadPaginas, setCantidadPaginas] = useState(0);
    const [totalReservas, setTotalReservas] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const paginaParam = searchParams.get('pagina');
    const pagina = paginaParam ? parseInt(paginaParam) : 1;

    useEffect(() => {
        const buscarReservas = async () => {
            const { reservas, cantidadPaginas, totalReservas } =
                await getReservasPaginadas({ pagina, propiedadId });
            setReservas(reservas);
            setCantidadPaginas(cantidadPaginas);
            setTotalReservas(totalReservas);
        };

        buscarReservas();
    }, [searchParams]);

    const buscador = (e: ChangeEvent<HTMLInputElement>): void => {
        setSearch(e.target.value);
    };

    let results = [];

    if (!search) {
        results = reservas;
    } else {
        results = reservas.filter((dato) =>
            dato.cliente.nombre
                .toLowerCase()
                .includes(search.toLocaleLowerCase())
        );
    }


	const refrescar = () => {
		window.location.reload();
		router.refresh();
	};


    const handleEditar = (reserva: any) => {
        reserva.propiedadId = propiedadId;
		setReservaSeleccionada(reserva);
		setIsModalOpen(true);
	};

    return (
        <div className='w-full'>
            <div className='w-full flex justify-between items-center mb-3 mt-1 pl-3'>
                <div></div>
                <div className='ml-3'>
                    <div className='w-full max-w-sm min-w-[200px] relative'>
                        <div className='relative'>
                            <input
                                value={search}
                                onChange={buscador}
                                className='bg-white w-full pr-11 h-10 pl-3 py-2 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-200 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md'
                                placeholder='Buscar Reserva...'
                            />
                            <button
                                className='absolute h-8 w-8 right-1 top-1 my-auto px-2 flex items-center bg-white rounded '
                                type='button'
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    strokeWidth='3'
                                    stroke='currentColor'
                                    className='w-8 h-8 text-slate-600'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className='relative flex flex-col  w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border'>
                <table className='w-full text-center text-sm table-auto min-w-max'>
                    <thead>
                        <tr>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>
                                <p className=' font-normal leading-none text-slate-500'>
                                    Cliente
                                </p>
                            </th>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>
                                <p className=' font-normal leading-none text-slate-500'>
                                    Contacto
                                </p>
                            </th>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>
                                <p className=' font-normal leading-none text-slate-500'>
                                    Unidad
                                </p>
                            </th>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>
                                <p className=' font-normal leading-none text-slate-500'>
                                    Fecha de Creación
                                </p>
                            </th>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>
                                <p className=' font-normal leading-none text-slate-500'>
                                    Fecha Inicio
                                </p>
                            </th>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>
                                <p className=' font-normal leading-none text-slate-500'>
                                    Fecha Fin
                                </p>
                            </th>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>
                                <p className=' font-normal leading-none text-slate-500'>
                                    Estado
                                </p>
                            </th>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>
                                <p className=' font-normal leading-none text-slate-500'>
                                    Pago Parcial
                                </p>
                            </th>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>
                                <p className=' font-normal leading-none text-slate-500'>
                                    Precio Total
                                </p>
                            </th>
                            <th className='p-4 border-b border-slate-200 bg-slate-50'>					
							</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map((reserva: any) => (
                            <tr
                                key={reserva.id}
                                className='hover:bg-slate-50 border-b border-slate-200'
                            >
                                <td className='p-4 py-5'>
                                    <p className='block font-semibold text-slate-800'>
                                        {reserva.cliente.nombre}
                                    </p>
                                </td>
                                <td className='p-1 py-5'>
                                    <div className='flex items-center font-semibold text-verdeIntermedio'>
                                        <BsWhatsapp className='text-md' />
                                        <a
                                            href={`https://wa.me/${reserva.cliente.telefono}/`}
                                            className='ml-2'
                                        >
                                            {reserva.cliente.telefono}
                                        </a>
                                    </div>
                                    {reserva.cliente.email && (
                                        <div className='flex items-center font-semibold text-blue-400'>
                                            <BiEnvelope className='text-xl' />
                                            <p className='block ml-2 font-semibold text-blue-400'>
                                                {reserva.cliente.email}
                                            </p>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <p>{reserva.unidad.nombre}</p>
                                </td>
                                <td className='p-1 py-5'>
                                    <p className='font-bold text-slate-500'>
                                        {reserva.fechaHoraCreacion.toLocaleDateString(
                                            'es-AR',
                                            {
                                                timeZone: 'GMT',
                                            }
                                        )}
                                    </p>
                                </td>
                                <td className='p-1 py-5'>
                                    <p className='font-bold text-slate-500'>
                                        {reserva.fechaInicio.toLocaleDateString(
                                            'es-AR',
                                            {
                                                timeZone: 'GMT',
                                            }
                                        )}
                                    </p>
                                </td>
                                <td className='p-1 py-5'>
                                    <p className='font-bold text-slate-500'>
                                        {reserva.fechaFin.toLocaleDateString(
                                            'es-AR',
                                            {
                                                timeZone: 'GMT',
                                            }
                                        )}
                                    </p>
                                </td>
                                <td className='p-2 py-5'>
                                    <div
                                        className={` text-center select-none whitespace-nowrap rounded-lg py-2 px-3.5 align-baseline font-sans font-semibold uppercase leading-none text-white ${
                                            reserva.estado ===
                                                EstadoReserva.PENDIENTE ||
                                            reserva.estado ===
                                                EstadoReserva.SOLICITADA
                                                ? 'bg-amber-400'
                                                : reserva.estado ===
                                                  EstadoReserva.PAGO_PARCIAL
                                                ? 'bg-verdeClaro'
                                                : reserva.estado ===
                                                  EstadoReserva.PAGADA
                                                ? 'bg-verdeIntermedio'
                                                : reserva.estado ===
                                                  EstadoReserva.CANCELADA
                                                ? 'bg-red-500'
                                                : ''
                                        }`}
                                    >
                                        {reserva.estado}
                                    </div>
                                </td>
                                <td className='p-1 py-5'>
                                    <p className='text-slate-500'>
                                        ${reserva.pagoParcial}
                                    </p>
                                </td>
                                <td className='p-1 py-5'>
                                    <p className='text-slate-500'>
                                        ${reserva.precioTotal}
                                    </p>
                                </td>
                                <td>
                                    <div className='flex gap-2 justify-center'>
                                        <Tooltip content='Editar'>
                                            <Button
                                                size='md'
                                                variant='text'
                                                color='orange'
                                                onClick={() => handleEditar(reserva)}
                                            >
                                                <FaPencilAlt size={18} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Paginacion
                    totalRegistros={totalReservas}
                    cantidadPaginas={cantidadPaginas}
                    entidad='Reservas'
                />
            </div>
            {isModalOpen && (
                <FormReserva
                    isOpen={true}
                    setIsOpen={setIsModalOpen}
                    isFromCalendario={true}
                    reservaAEditar={reservaSeleccionada}
                    refrescar={refrescar}
                />
            )}
        </div>
    );
};

export default Tabla;
