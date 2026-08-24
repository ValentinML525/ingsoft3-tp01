'use client';
import Image from 'next/image';
import React from 'react';
export function Galeria({ imagenes }: { imagenes: any[] }) {
	const initialUrl = imagenes && imagenes.length > 0 ? imagenes[0].url : '';
	const [active, setActive] = React.useState(initialUrl);

	if (!imagenes || imagenes.length === 0) {
		return (
			<div className='flex justify-center items-center h-full mb-2'>
			  <p className='text-red-500'>No se encontraron imágenes...</p>
			</div>
		  );
	}

	return (
		<div className='grid gap-4'>
			<div className='relative w-full h-[480px]'>
				<Image
					className='h-auto w-full max-w-full rounded-lg object-contain object-center md:h-[480px]' //"cambiar object-cover por object-contain"
					src={active}
					alt=''
					fill
				/>
			</div>
			<div className='grid grid-cols-5 gap-4'>
				{imagenes.map((imagen, index) => (
					<div key={index} className='relative h-20'>
						<Image
							onClick={() => setActive(imagen.url)}
							src={imagen.url}
							className='h-full max-w-full cursor-pointer rounded-lg object-cover object-center'
							alt='gallery-image'
							fill
						/>
					</div>
				))}
			</div>
		</div>
	);
}
