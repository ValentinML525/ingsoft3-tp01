import { Typography } from '@/components/Client/MaterialTailwindClient';
import { FaHome, FaMap, FaMapMarkerAlt, FaRoad } from 'react-icons/fa';
import MapaConMarcador from '../Mapas/MapaConMarcador';

function HeroPropiedad({ propiedad }: { propiedad: any }) {
	const position = [propiedad.ubicacion.latitud, propiedad.ubicacion.longitud];

	return (
		<>
			<header className='rounded-lg'>
				<div className='flex flex-col lg:flex-row p-8 w-full rounded-lg justify-center items-center bg-gradient-to-r from-green-800 to-light-green-300'>
					<div className='flex flex-col gap-5 w-full md:w-2/3 text-center md:text-start p-5'>
						<div>
							<Typography variant='h1' color='white' className='mx-auto w-full'>
								{propiedad.nombre}
							</Typography>
						</div>
						<div className='flex items-center'>
							<FaHome size={25} color='white' />
							<Typography
								variant='lead'
								color='white'
								className='mx-auto w-full ml-5'
							>
								{propiedad.tipo.nombre}
							</Typography>
						</div>
						<div className='flex items-center'>
							<FaMapMarkerAlt size={25} color='white' />
							<div>
								<Typography
									variant='lead'
									color='white'
									className='mx-auto w-full ml-5'
								>
									{propiedad.ubicacion.ciudad}
								</Typography>
							</div>
						</div>
					</div>

					<div className='w-full h-64 mt-5'>
						<MapaConMarcador
							position={position}
							nombre={propiedad.nombre}
							ciudad={propiedad.ubicacion.ciudad}
						/>
					</div>
				</div>
			</header>
		</>
	);
}

export default HeroPropiedad;
