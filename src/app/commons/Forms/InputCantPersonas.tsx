import {
	Input,
	IconButton,
	Typography,
} from '@/components/Client/MaterialTailwindClient';

import { useFormContext } from 'react-hook-form';

interface Props {
	handleCambioCantPersonas?: (cantidad: any) => void;
	deshabilitado?: boolean;
}

export function InputCantPersonas({ handleCambioCantPersonas = () => {}, deshabilitado }: Props) {
	const {
		register,
		setValue,
		watch,
		getValues,
		formState: { errors },
	} = useFormContext();

	const cantPersonas = watch('cantidadPersonas');

	const onCambioCantidadPersonas = (cantidad: any) => {
		handleCambioCantPersonas(cantidad);
	};

	const handleQuitar = () => {
		const nuevoValor = Number(cantPersonas) === 0 ? 0 : cantPersonas - 1;
		handleCambioCantPersonas(nuevoValor);
	};

	const handleAgregar = () => {
		const nuevoValor = Number(cantPersonas) + 1;
		handleCambioCantPersonas(nuevoValor);
	};

	return (
		<div className='w-full'>
			<div className='relative w-full'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					className='absolute left-2.5 top-5 h-5 w-5'
				>
					<path d='M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z'></path>
				</svg>
				<Input
					disabled={deshabilitado}
					value={getValues('cantPersonas')}
					label='Personas'
					className='!border-t-blue-gray-200 pl-10 pb-3 placeholder:text-blue-gray-300 placeholder:opacity-200'
					labelProps={{
						className: `before:content-none after:content-none pl-10 ${
							errors.cantidadPersonas ? 'text-red-500' : ''
						}`,
					}}
					containerProps={{
						className: 'min-w-0',
					}}
					{...register('cantidadPersonas', {
						required: 'Este campo es requerido.',
						valueAsNumber: true,
						validate: (value: any) => value > 0 || 'Este campo es requerido',
						pattern: {
							value: /^[0-9]+$/, // Expresión regular para solo números
							message: 'Solo se permiten números',
						},
					} as any)}
				/>

				<div className='absolute right-1 top-3 flex gap-0.5'>
					<IconButton
						size='sm'
						color='light-green'
						className='rounded'
						variant='text'
						onClick={handleQuitar}
						disabled={deshabilitado}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 16 16'
							fill='currentColor'
							className='h-4 w-4'
						>
							<path d='M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z' />
						</svg>
					</IconButton>
					<IconButton
						size='sm'
						color='light-green'
						className='rounded'
						variant='text'
						onClick={handleAgregar}
						disabled={deshabilitado}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 16 16'
							fill='currentColor'
							className='h-4 w-4'
						>
							<path d='M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z' />
						</svg>
					</IconButton>
				</div>
			</div>
			{errors.cantidadPersonas && (
				<p className='text-red-500'>{String(errors.cantidadPersonas?.message || '')}</p>
			)}
		</div>
	);
}
