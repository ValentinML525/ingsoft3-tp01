'use client';
import Image from 'next/image';

import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Typography,
	Button,
	Tooltip,
	IconButton,
} from '@/components/Client/MaterialTailwindClient';
import Link from 'next/link';
import { FaMapMarkedAlt, FaUsers } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { IconoServicio } from '@/components/Servicios/IconoServicio';

interface Props {
	unidad: any;
	mostrarBotonDetalles: boolean;
	datosBusqueda?: any;
}

//TODO: renderizar los iconos de los servicios y su descripcion
export const TarjetaVerticalUnidad = ({
	mostrarBotonDetalles,
	unidad,
	datosBusqueda,
}: Props) => {
	const router = useRouter();

	const handleClickDetalles = () => {
		const searchParams = new URLSearchParams(datosBusqueda);

		router.push(
			`/${unidad.propiedad.slug}/${unidad.slug}?${searchParams.toString()}`
		);
	};

	return (
		<Card className='w-full max-w-[26rem] shadow-lg'>
			<CardHeader floated={false} color='blue-gray'>
				<div className='relative h-[300px] w-full overflow-hidden rounded-t-lg'>
					{unidad.imagenes && unidad.imagenes.length > 0 ? (
						<Image
							src={unidad.imagenes[0].url}
							width={400}
							height={300}
							alt={`Imagen de la Unidad`}
							className='h-full w-full object-cover rounded-lg'
						/>
					) : (
						<p className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white'>
							No hay imágenes disponibles.
						</p>
					)}
					<div className='to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-tr from-transparent via-transparent to-black/60 ' />
				</div>
			</CardHeader>
			<CardBody>
				<Typography variant='h6' color='blue-gray' className='font-medium'>
					{unidad.propiedad?.nombre}
				</Typography>
				<div className='mb-3 flex items-center justify-between'>
					<Typography variant='h4' color='blue-gray' className='font-medium'>
						{unidad.nombre}
					</Typography>
				</div>
				<div className='flex flex-col gap-3 items-start'>
					<div className='flex gap-3'>
						<FaMapMarkedAlt size={25} className='text-verdeIntermedio' />
						<Typography color='gray'>
							{unidad.propiedad.ubicacion.ciudad}
						</Typography>
					</div>

					<div className='flex gap-3'>
						<FaUsers size={25} className='text-yellow-700' />
						<Typography color='gray'>{unidad.capacidad} Personas</Typography>
					</div>
				</div>
				<div className='group mt-8 inline-flex flex-wrap items-center gap-3'>
					{unidad.servicios &&
						unidad.servicios.slice(0, 4).map((servicio: any, index: number) => (
							<Tooltip
								key={index}
								content={
									<span className='text-md'>{servicio.servicio.nombre}</span>
								}
							>
								<span className='cursor-pointer rounded-full border border-gray-900/5 bg-gray-900/5 p-3 text-gray-900 transition-colors hover:border-gray-900/10 hover:bg-gray-900/10 hover:!opacity-100 group-hover:opacity-70'>
									<div className='w-6'>
										<IconoServicio svgString={servicio.servicio.icon} />
									</div>
								</span>
							</Tooltip>
						))}

					{unidad.servicios && unidad.servicios.length > 4 && (
						<Tooltip content={`${unidad.servicios.length - 4} más`}>
							<span className='cursor-pointer rounded-full border border-gray-900/5 bg-gray-900/5 p-3 text-gray-900 transition-colors hover:border-gray-900/10 hover:bg-gray-900/10 hover:!opacity-100 group-hover:opacity-70'>
								+{unidad.servicios.length - 4}
							</span>
						</Tooltip>
					)}
				</div>
			</CardBody>
			<CardFooter className='pt-3'>
				{mostrarBotonDetalles && (
					<Button
						className='bg-verdeIntermedio'
						size='lg'
						fullWidth={true}
						onClick={handleClickDetalles}
					>
						Detalles
					</Button>
				)}
			</CardFooter>
		</Card>
	);
};
