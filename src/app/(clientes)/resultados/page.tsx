'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { NavbarBusqueda } from '@/components/Navbar/NavbarBusqueda';
import { TarjetaVerticalUnidad } from '@/components/Unidades/Cliente/TarjetaVerticalUnidad';
import {
	getAllUnidades,
	getUnidadesDisponiblesPorUbicacion,
} from '@/actions/unidades/unidades';
import { FaExclamationCircle } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

function ResultadosContent() {
	const [unidades, setUnidades] = useState<any[]>([]);
	const [busquedaRealizada, setBusquedaRealizada] = useState(false);
	const [datosBusqueda, setDatosBusqueda] = useState<any>(null);

	const navbarRef = useRef<any>(null);

	const searchParams = useSearchParams();

	useEffect(() => {
		const buscarUnidades = async () => {
			await fetchUnidades();
		};

		buscarUnidades();
	}, []);

	const fetchUnidades = async () => {
		const unidades = await getAllUnidades();
		setUnidades(unidades);
	};

	useEffect(() => {
		const buscarUnidades = async () => {
			const ubicacionId = searchParams.get('ubicacionId');
			const fechaInicio = searchParams.get('fechaInicio');
			const fechaFin = searchParams.get('fechaFin');
			const cantidadPersonas = searchParams.get('cantidadPersonas');

			const datos = {
				ubicacionId: +(ubicacionId || 0),
				cantidadPersonas: +(cantidadPersonas || 1),
				rangoFechas: {
					from: fechaInicio ? new Date(fechaInicio) : new Date(),
					to: fechaFin ? new Date(fechaFin) : new Date(),
				},
			};

			await buscar(datos);
			setBusquedaRealizada(true);
		};

		if (unidades && searchParams && !busquedaRealizada) {
			buscarUnidades();
		}
	}, [unidades, searchParams]);

	const buscar = async (datos: any) => {
		const unidadesDisponibles = await getUnidadesDisponiblesPorUbicacion(
			datos.ubicacionId,
			datos.cantidadPersonas,
			datos.rangoFechas.from,
			datos.rangoFechas.to
		);

		setDatosBusqueda({
			fechaInicio: datos.rangoFechas.from,
			fechaFin: datos.rangoFechas.to,
			cantPersonas: datos.cantidadPersonas,
		});

		setUnidades(unidadesDisponibles);
		setBusquedaRealizada(true);
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
			<div className='flex flex-row'>
				<NavbarBusqueda accionAEjecutar={buscar} />
			</div>
			{unidades && unidades.length > 0 ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10'>
					{unidades.map((unidad, index) => (
						<div key={index}>
							<TarjetaVerticalUnidad
								unidad={unidad}
								mostrarBotonDetalles={true}
								datosBusqueda={{
									...datosBusqueda,
									unidadId: unidad.id,
								}}
							/>
						</div>
					))}
				</div>
			) : (
				busquedaRealizada && (
					<div className='flex flex-col w-full items-center justify-center gap-5 mt-10'>
						<FaExclamationCircle className='text-yellow-700 text-3xl' />
						<h5 className='text-xl font-semibold text-gray-800 text-center'>
							No se encontraron Unidades disponibles para las condiciones
							seleccionadas.
						</h5>
						<button className='bg-light-green-500 hover:bg-light-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors' onClick={handleReiniciarBusqueda}>
							Reiniciar Búsqueda
						</button>
					</div>
				)
			)}
		</>
	);
}

export default function Resultados() {
	return (
		<Suspense fallback={<div>Cargando...</div>}>
			<ResultadosContent />
		</Suspense>
	);
}
