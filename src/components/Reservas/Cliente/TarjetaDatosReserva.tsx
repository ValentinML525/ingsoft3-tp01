'use client';
import { calcularCantidadNoches } from '@/actions/funciones-globales/funciones-globales';
import { getUnidadPorId } from '@/actions/unidades/unidades';
import {
	Card,
	CardBody,
	CardFooter,
	Typography,
	Button,
	Chip,
	Spinner,
} from '../../Client/MaterialTailwindClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaMoon, FaUser } from 'react-icons/fa';
import { url } from 'inspector';

export function TarjetaDatosReserva() {
	const [unidad, setUnidad] = useState<any>();
	const [fechaInicioFormateada, setFechaInicioFormateada] = useState('');
	const [fechaFinFormateada, setFechaFinFormateada] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [precioTotal, setPrecioTotal] = useState(0);
	const [cantNoches, setCantNoches] = useState(0);

	const router = useRouter();

	const searchParams = useSearchParams();

	const unidadId = searchParams.get('unidadId');
	const fechaInicio = searchParams.get('fechaInicio');
	const fechaFin = searchParams.get('fechaFin');
	//Atencion, cantPersonas viene por parametro y cantidadPersonas viene del input
	const cantPersonas = searchParams.get('cantPersonas');

	useEffect(() => {
		const buscarUnidad = async () => {
			if (unidadId) {
				const result = await getUnidadPorId(Number(unidadId));
				setUnidad(result);
			}
		};

		const formatoFechaInicio = fechaInicio
			? format(new Date(fechaInicio), "eeee d 'de' MMMM 'de' yyyy", { locale: es })
			: '';

		const formatoFechaFin = fechaFin
			? format(new Date(fechaFin), "eeee d 'de' MMMM 'de' yyyy", { locale: es })
			: '';

		const noches = calcularCantidadNoches(fechaInicio || '', fechaFin || '');
		setCantNoches(noches);
		setFechaInicioFormateada(formatoFechaInicio);
		setFechaFinFormateada(formatoFechaFin);
		buscarUnidad();

		setIsLoading(false);
	}, []);

	return (
		<>
			{isLoading ? (
				<div className='flex w-full justify-center'>
					<Spinner color='green' className='h-8 w-8' />
				</div>
			) : (
				<Card className='mt-6 w-full'>
					<CardBody>
						<div className='flex flex-row gap-10'>
							<div className='w-1/4'>
								<div className='h-20 w-full relative mb-4 rounded-lg overflow-hidden'>
									{unidad?.imagenes[0] ? (
										<Image
											src={unidad?.imagenes[0].url}
											alt='Imagen Unidad'
											fill
											className='object-cover object-center'
										/>
									) : (
										<div className='flex w-full justify-center'>
											<Spinner color='green' className='h-8 w-8' />
										</div>
									)}
								</div>
							</div>
							<div className=''>
								<Typography variant='h5' className=''>
									{unidad?.propiedad.nombre}
								</Typography>
								<Typography variant='h5' className=''>
									{unidad?.nombre}
								</Typography>
								<Typography variant='h5' className=''>
									{unidad?.propiedad.ubicacion.ciudad}
								</Typography>
							</div>
						</div>

						<hr className='border-t border-gray-300' />

						<Typography
							variant='h3'
							color='blue-gray'
							className='my-10 text-center'
						>
							Datos de tu Reserva
						</Typography>

						<div className='flex flex-col w-full justify-center items-center mb-10 gap-5'>
							<Chip
								className='text-md w-1/2 text-center'
								variant='ghost'
								size='lg'
								value={`${cantPersonas} Personas`}
								icon={<FaUser className='relative top-1 left-1' />}
							/>

							<Chip
								className='text-md w-1/2 text-center'
								size='lg'
								value={`${cantNoches} Noches`}
								icon={<FaMoon className='relative top-1 left-1' />}
							/>
						</div>

						<div className='my-2'>
							<div className='flex flex-col items-center mb-10'>
								<Typography variant='h5' color='green' className=''>
									{fechaInicioFormateada}
								</Typography>
								<Typography variant='lead' className=''>
									al
								</Typography>
								<Typography variant='h5' color='green' className=''>
									{fechaFinFormateada}
								</Typography>
							</div>
						</div>
						<div className='flex justify-center'>
							{unidad?.precioPorNoche && cantNoches > 0 && (
								<Chip
									className='w-fit text-md'
									color='light-green'
									variant='ghost'
									size='lg'
									value={`Total: $ ${(
										unidad.precioPorNoche * cantNoches
									).toLocaleString('es-AR')}`}
								/>
							)}
						</div>
					</CardBody>
				</Card>
			)}
		</>
	);
}
