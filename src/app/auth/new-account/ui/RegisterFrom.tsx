'use client';

import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { login, registerUser } from '@/actions';
import { Card, Input, Button, Typography } from '@/components/Client/MaterialTailwindClient';

type FormInputs = {
	name: string;
	email: string;
	password: string;
};

export const RegisterForm = () => {
	const [errorMessage, setErrorMessage] = useState('');
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormInputs>();

	const onSubmit: SubmitHandler<FormInputs> = async (data) => {
		setErrorMessage('');
		const { name, email, password } = data;
		const resp = await registerUser(name, email, password);

		if (!resp.ok) {
			setErrorMessage(resp.message);
			return;
		}

		await login(email.toLowerCase(), password);
		window.location.replace('/dashboard/propiedades');
	};

	return (
		<Card color='transparent' shadow={false} className='p-8'>
			<Typography className='font-thin text-gray-400 text-center mb-8'>
				¡Crea una cuenta para comenzar a usar el sistema!
			</Typography>

			<form onSubmit={handleSubmit(onSubmit)} className=' flex flex-col gap-6'>
				<div>
					<Input
						label='Nombre completo'
						type='text'
						autoFocus
						size='lg'
						{...register('name', { required: 'El nombre es obligatorio' })}
						error={!!errors.name}
						className='!border-t-blue-gray-200 focus:!border-t-gray-900'
					/>
				</div>
				{errors.name && (
					<div className='text-red-500'>{errors.name.message}</div>
				)}

				<div>
					<Input
						label='Correo electrónico'
						type='email'
						size='lg'
						{...register('email', {
							required: 'El correo electrónico es obligatorio',
							pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' },
						})}
						error={!!errors.email}
						className='!border-t-blue-gray-200 focus:!border-t-gray-900'
					/>
				</div>
				{errors.email && (
					<div className='text-red-500'>{errors.email.message}</div>
				)}

				<div>
					<Input
						label='Contraseña'
						type='password'
						size='lg'
						{...register('password', {
							required: 'La contraseña es obligatoria',
						})}
						error={!!errors.password}
						className='!border-t-blue-gray-200 focus:!border-t-gray-900'
					/>
				</div>

				{errors.password && (
					<div className='text-red-500'>{errors.password.message}</div>
				)}

				<Button
					type='submit'
					className='mt-6 bg-verdeIntermedio hover:bg-verdeOscuro'
					fullWidth
				>
					Crear cuenta
				</Button>

				<Typography color='gray' className='mt-4 text-center font-normal'>
					¿Ya tenés una cuenta?{' '}
					<a href='/auth/login' className='font-semibold text-orange-700'>
						Iniciar sesión.
					</a>
				</Typography>
			</form>
		</Card>
	);
};
