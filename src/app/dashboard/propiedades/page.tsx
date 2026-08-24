// import { ModalPropiedad } from '@/components/Propiedades/ModalPropiedad';
import { getAllPropiedades } from '@/actions/propiedades/propiedades';
import { BotonRegistrarPropiedad } from '@/components/Propiedades/BotonRegistrarPropiedad';
import TarjetaPropiedad from '@/components/Propiedades/TarjetaPropiedad';

export const metadata = {
	title: 'Propiedades',
	description: 'Página de gestión de Propiedades',
};

export default async function Propiedades() {
	const propiedades = await getAllPropiedades();

	return (
		<>
		<div>
			<h1 className="text-3xl font-bold mb-6 text-left bg-light-green-600 text-white py-2 px-4 rounded shadow-lg">
				  Propiedades
		  	</h1>
		
			<div className='flex justify-center mb-6'>
				<BotonRegistrarPropiedad />
			</div>
			<div>
				<TarjetaPropiedad propiedades={propiedades} />
			</div>
		</div>
		</>
	);
}
