'use client';
import { getNombrePropiedadPorUnidadId } from '@/actions/unidades/unidades';
import {
	Card,
	CardBody,
	Typography,
} from '@/components/Client/MaterialTailwindClient';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function TarjetaSimple() {
	const [nombrePropiedad, setNombrePropiedad] = useState('');

	const searchParams = useSearchParams();

	const unidadId = searchParams.get('unidadId');

	const descripcion =
		'Por favor, revisá la información y completá los datos requeridos.';

	useEffect(() => {
		const buscarNombrePropiedad = async () => {
			if (unidadId) {
				const result = await getNombrePropiedadPorUnidadId(Number(unidadId));
				setNombrePropiedad(result || '');
			}
		};

		buscarNombrePropiedad();
	}, []);

	return (
		<Card className='flex mt-6 w-full'>
			<CardBody>
				<div className='flex w-full gap-4 items-center mb-2'>
					<Typography variant='h5' color='blue-gray'>
						Tu reserva en
					</Typography>
					<Typography variant='h4' color='green'>
						{nombrePropiedad}
					</Typography>
				</div>
				<Typography className='' variant='lead'>
					{descripcion}
				</Typography>
			</CardBody>
		</Card>
	);
}
