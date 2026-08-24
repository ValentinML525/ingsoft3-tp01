'use client';

import { useState } from 'react';
import { Button } from '@/components/Client/MaterialTailwindClient';
import { FormPropiedad } from './FormPropiedad';

export const BotonRegistrarPropiedad = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div className='mb-10'>
				<Button onClick={() => setIsOpen(true)} color='light-green'>
					Registrar Propiedad
				</Button>
			</div>

			{isOpen && <FormPropiedad isOpen={isOpen} setIsOpen={setIsOpen} />}
		</>
	);
};
