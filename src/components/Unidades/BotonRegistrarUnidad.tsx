'use client';

import { useState } from 'react';
import { Button } from '@/components/Client/MaterialTailwindClient';
import { FormUnidad } from './FormUnidad';

export const BotonRegistrarUnidad = ({ propiedadId }: { propiedadId?: any }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div className='mb-10'>
				<Button onClick={() => setIsOpen(true)} color='light-green'>
					Registrar Unidad
				</Button>
			</div>
			{isOpen && (
				<FormUnidad
					isOpen={isOpen}
					setIsOpen={setIsOpen}
					propiedadId={propiedadId}
				/>
			)}
		</>
	);
};
