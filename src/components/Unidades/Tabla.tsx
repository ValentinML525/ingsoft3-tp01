'use client';

import { ServiciosXUnidad, Unidad } from '@prisma/client';
import { useState } from 'react';
import { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Paginacion } from '../../app/commons/Paginacion';
import {
	FaExclamationTriangle,
	FaPencilAlt,
	FaRegTimesCircle,
} from 'react-icons/fa';
import {
	Button,
	Chip,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Switch,
	Tooltip,
	Typography,
} from '@/components/Client/MaterialTailwindClient';
import { IconoServicio } from '../Servicios/IconoServicio';
import { FormUnidad } from './FormUnidad';
import { eliminarUnidad } from '@/actions/unidades/unidades';
import { DialogExito } from '../../app/commons/Dialogs/DialogExito';
import { Galeria } from '@/components/Unidades/Cliente/Galeria';
import { FaWindowClose } from 'react-icons/fa';
import { actualizarEstadoUnidad } from '@/actions/unidades/unidades';

interface Props {
	unidades: Unidad[];
	cantidadPaginas: number;
	paginaActual?: number;
	totalUnidades: number;
}

export const TablaUnidades = ({
	unidades = [],
	totalUnidades,
	cantidadPaginas,
}: Props) => {
	const [search, setSearch] = useState('');
	const [mostrarForm, setMostrarForm] = useState(false);
	const [unidadSeleccionada, setUnidadSeleccionada] = useState<any>();
	const [mostrarAdvertenciaEliminacion, setMostrarAdvertenciaEliminacion] =
		useState(false);
	const [eliminandoUnidad, setEliminandoUnidad] = useState(false);
	const [mostrarDialogExito, setMostrarDialogExito] = useState(false);
	const [selectedUnidad, setSelectedUnidad] = useState<any>(null);

	const router = useRouter();

	const buscador = (e: ChangeEvent<HTMLInputElement>): void => {
		setSearch(e.target.value);
	};

	let results = [];
	if (!search) {
		results = unidades;
	} else {
		results = unidades.filter((dato: { nombre: string }) =>
			dato.nombre.toLowerCase().includes(search.toLocaleLowerCase())
		);
	}

	const handleEditar = (unidad: any) => {
		setUnidadSeleccionada(unidad);
		setMostrarForm(true);
	};

	const handleEliminar = (unidad: any) => {
		setUnidadSeleccionada(unidad);
		setMostrarAdvertenciaEliminacion(true);
	};

	const handleAtras = () => {
		setMostrarAdvertenciaEliminacion(false);
	};

	const handleConfirmarEliminacion = async () => {
		setEliminandoUnidad(true);

		const ok = await eliminarUnidad(unidadSeleccionada);

		setEliminandoUnidad(false);

		if (ok) {
			setMostrarDialogExito(true);
		}
	};

	const finalizarEliminacion = () => {
		setMostrarDialogExito(false);
		setMostrarAdvertenciaEliminacion(false);
		router.refresh();
	};

	const handleToggleHabilitada = async (
		unidadId: number,
		habilitada: boolean
	) => {
		actualizarEstadoUnidad(unidadId, habilitada);
		router.refresh();
	};

	const handleOpenGaleria = (unidad: any) => {
		setSelectedUnidad(unidad);
	};

	return (
		<>
			{mostrarDialogExito && (
				<DialogExito accionAlConfirmar={finalizarEliminacion} />
			)}
			{mostrarAdvertenciaEliminacion && (
				<Dialog
					open={mostrarAdvertenciaEliminacion}
					handler={handleEliminar}
					size='sm'
				>
					<DialogHeader>
						<div className='flex flex-col w-full justify-center gap-5 items-center'>
							<FaExclamationTriangle size={40} className='text-yellow-700' />
							Atención!
						</div>
					</DialogHeader>
					<DialogBody className='flex flex-col text-center gap-3'>
						<Typography variant='h4'>
							Está a punto de eliminar una unidad. La unidad NO cuenta con reservas asociadas.
						</Typography>

						<Typography color='red' variant='h4' className='mt-4'>
							Esta acción no se puede deshacer.
						</Typography>

						<Typography variant='lead' className='mt-5 mb-2'>
							¿Está seguro que desea continuar?
						</Typography>

						<Typography color='light-green' variant='lead' >
							*Se recomienda deshabilitar la Unidad en su lugar.
						</Typography>
					</DialogBody>
					<DialogFooter className='flex justify-center gap-10'>
						<Button variant='outlined' onClick={handleAtras} className='w-fit'>
							<span>Atrás</span>
						</Button>
						<Button
							variant='gradient'
							color='red'
							onClick={handleConfirmarEliminacion}
							className='w-fit'
							loading={eliminandoUnidad}
						>
							<span>Confirmar</span>
						</Button>
					</DialogFooter>
				</Dialog>
			)}

			<div className='mx-auto'>
				<div className='w-full flex justify-between items-center mb-3 mt-1 pl-3'>
					<div></div>
					<div className='ml-3'>
						<div className='w-full max-w-sm min-w-[200px] relative'>
							<div className='relative'>
								<input
									value={search}
									onChange={buscador}
									className='bg-white w-full pr-11 h-10 pl-3 py-2 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-200 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md'
									placeholder='Buscar Unidad...'
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

				<div className='relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border'>
					<table className='w-full text-sm table-auto min-w-max'>
						<thead>
							<tr>
								<th className='p-4 border-b border-slate-200 bg-slate-50'>
									<p className='font-normal leading-none text-slate-500'>
										Nombre
									</p>
								</th>
								<th className='p-4 border-b border-slate-200 bg-slate-50'>
									<p className='font-normal leading-none text-slate-500'>
										Capacidad
									</p>
								</th>
								<th className='p-4 border-b border-slate-200 bg-slate-50'>
									<p className='font-normal leading-none text-slate-500'>
										Servicios
									</p>
								</th>
								<th className='p-4 border-b border-slate-200 bg-slate-50'>
									<p className='font-normal leading-none text-slate-500'>
										Precio por Noche
									</p>
								</th>
								<th className='p-4 border-b border-slate-200 bg-slate-50'>
									<p className='font-normal leading-none text-slate-500'>
										Imágenes
									</p>
								</th>
								<th className='p-4 border-b border-slate-200 bg-slate-50'>
									<p className='font-normal leading-none text-slate-500'>
										Opciones
									</p>
								</th>
								<th className='p-4 border-b border-slate-200 bg-slate-50'>
									<p className='font-normal leading-none text-slate-500'>
										Habilitada
									</p>
								</th>
							</tr>
						</thead>
						<tbody>
							{results.length === 0 && (
								<tr className='text-md text-gray-700 dark:bg-gray-700 dark:text-gray-400'>
									<td colSpan={6} className='px-6 py-4 text-center'>
										No se han encontrado unidades
									</td>
								</tr>
							)}
							{results.length > 0 &&
								results.map((unidad: any, index: number) => (
									<tr
										key={index}
										className='hover:bg-slate-50 border-b border-slate-200'
									>
										<td className='p-4 py-5 text-center'>
											<Chip
												color='green'
												className='text-md'
												variant='ghost'
												value={unidad.nombre}
											/>
										</td>
										<td className='p-4 py-5 text-center'>
											<p className='font-semibold text-lg text-slate-500'>
												{unidad.capacidad} pers.
											</p>
										</td>
										<td className='p-4 py-5 text-center place-items-center justify-center items-center'>
											<div className='grid grid-cols-7 gap-5 '>
												{unidad.servicios && unidad.servicios.length > 0
													? unidad.servicios.map((servicioXUnidad: any, index: number) => (
															<Tooltip
																key={index}
																content={
																	<span className='text-md'>
																		{servicioXUnidad.servicio.nombre}
																	</span>
																}
															>
																<div className='w-6 cursor-pointer'>
																	<IconoServicio
																		svgString={servicioXUnidad.servicio.icon}
																	/>
																</div>
															</Tooltip>
													  ))
													: 'Sin servicios'}
											</div>
										</td>
										<td className='p-4 py-5 text-center'>
											{unidad.precioPorNoche ? (
												<Chip
													color='green'
													variant='ghost'
													className='text-lg'
													value={`$${unidad.precioPorNoche.toLocaleString(
														'es-AR'
													)}`}
												/>
											) : (
												<Chip
													color='amber'
													className='text-md'
													value='No Visible'
												/>
											)}
										</td>
										<td className='p-4 py-5 text-center'>
											<Button
												onClick={() => handleOpenGaleria(unidad)}
												color='light-green'
											>
												Ver fotos
											</Button>
										</td>
										<td>
											<div className='flex gap-2 justify-center'>
												<Tooltip content='Editar'>
													<Button
														size='md'
														variant='text'
														color='orange'
														onClick={() => handleEditar(unidad)}
													>
														<FaPencilAlt size={18} />
													</Button>
												</Tooltip>
												<Tooltip content={(unidad.reservas.length > 0) ? 'No se puede eliminar una unidad con reservas' : 'Eliminar unidad'}>
													<div>
														<Button
															size='md'
															variant='text'
															color='red'
															onClick={() => handleEliminar(unidad)}
															disabled={unidad.reservas.length > 0}
														>
															<FaRegTimesCircle size={20} />
														</Button>
													</div>
												</Tooltip>
											</div>
										</td>
										<td className='p-4 py-5'>
											<div className='flex justify-center'>
												<Switch
													color='light-green'
													checked={unidad.habilitada}
													onChange={(e: any) =>
														handleToggleHabilitada(unidad.id, e.target.checked)
													}
												/>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>

					{selectedUnidad && (
						<div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
							<div className='bg-white p-4 rounded-lg w-full max-w-6xl'>
								<div className='flex justify-between mb-2'>
									<h2 className='text-xl mb-4'>{selectedUnidad.nombre}</h2>
									<Button
										size='md'
										variant='text'
										color='red'
										onClick={() => setSelectedUnidad(null)}
									>
										<FaWindowClose size={20} />
									</Button>
								</div>

								<Galeria imagenes={selectedUnidad.imagenes} />
							</div>
						</div>
					)}
				</div>

				<Paginacion
					cantidadPaginas={cantidadPaginas}
					totalRegistros={totalUnidades}
					entidad='Unidades'
				/>
			</div>

			{mostrarForm && (
				<FormUnidad
					isOpen={mostrarForm}
					setIsOpen={setMostrarForm}
					propiedadId={unidadSeleccionada.propiedadId}
					unidadAEditar={unidadSeleccionada}
				/>
			)}
		</>
	);
};

export default TablaUnidades;
