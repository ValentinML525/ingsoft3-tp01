'use client';
import { useEffect, useRef, useState } from 'react';
import {
	Navbar,
	Typography,
	IconButton,
	Button,
} from '../../../components/Client/MaterialTailwindClient';
import { useForm } from 'react-hook-form';

import Image from 'next/image';

import { Logo } from '../Logo';
import { CustomDatePicker } from './CustomDatePicker';
import { TarjetaHorizontal } from '@/components/Unidades/Cliente/TarjetaHorizontal';
import {
	getUnidadesDisponiblesPorPropiedad,
	getUnidadesPorPropiedad,
} from '@/actions/unidades/unidades';
import { FaExclamationCircle } from 'react-icons/fa';
import { NavbarBusqueda } from '@/components/Navbar/NavbarBusqueda';

type Inputs = {
	rangoFechas: Date[];
	cantidadPersonas: number;
};

export const FormBuscarUnidades = ({ propiedad }: { propiedad: any }) => {
	const [unidades, setUnidades] = useState<any[]>([]);
	const [busquedaRealizada, setBusquedaRealizada] = useState(false);
	const [datosBusqueda, setDatosBusqueda] = useState<any>(null);

	const navbarRef = useRef<any>(null);

	const buscar = async (datos: any) => {
		const unidadesEncontradas = await getUnidadesDisponiblesPorPropiedad(
			propiedad.id,
			datos.cantidadPersonas,
			datos.rangoFechas.from,
			datos.rangoFechas.to
		);

		setDatosBusqueda({
			fechaInicio: datos.rangoFechas.from,
			fechaFin: datos.rangoFechas.to,
			cantPersonas: datos.cantidadPersonas,
		});

		setUnidades(unidadesEncontradas);
		setBusquedaRealizada(true);
	};

	useEffect(() => {
		const buscarUnidades = async () => {
			await fetchUnidades();
		};

		if (propiedad) {
			buscarUnidades();
		}
	}, [propiedad]);

	const fetchUnidades = async () => {
		const unidades = await getUnidadesPorPropiedad(propiedad.id);
		setUnidades(unidades);
	};

	const handleReiniciarBusqueda = () => {
		if (navbarRef.current) {
			navbarRef.current.resetForm();
		}
		setBusquedaRealizada(false);
		setDatosBusqueda(null);
		fetchUnidades();
	};

	return (
		<>
			{/* Navbar para busqueda */}

			{propiedad && (
				<NavbarBusqueda
					ref={navbarRef}
					ubicacion={propiedad.ubicacion}
					accionAEjecutar={buscar}
				/>
			)}
			{/* Listado de Unidades */}
			<div className='mt-10 flex justify-center'>
				{propiedad && (
					<div className='w-full xl:w-2/3'>
						{unidades && unidades.length > 0
							? unidades.map((unidad, index) => (
									<div className='my-5' key={index}>
										<TarjetaHorizontal
											unidad={unidad}
											slugPropiedad={propiedad.slug}
											datosBusqueda={{
												...datosBusqueda,
												unidadId: unidad.id,
											}}
										/>
									</div>
							  ))
							: busquedaRealizada && (
									<div className='flex flex-col w-full items-center gap-5'>
										<FaExclamationCircle className='text-yellow-700 text-3xl' />
										<Typography variant='h5'>
											No se encontraron Unidades disponibles para las
											condiciones seleccionadas.
										</Typography>
										<Button variant='filled' onClick={handleReiniciarBusqueda}>
											Reiniciar Búsqueda
										</Button>
									</div>
							  )}
					</div>
				)}
			</div>
		</>
	);
};
