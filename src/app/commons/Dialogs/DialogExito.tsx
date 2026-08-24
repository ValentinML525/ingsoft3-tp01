'use client';
import { FaCheckCircle } from 'react-icons/fa';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Typography,
} from '../../../components/Client/MaterialTailwindClient';
import { useState } from 'react';

export const DialogExito = ({ accionAlConfirmar }: { accionAlConfirmar: () => void }) => {
	const [isOpen, setIsOpen] = useState(true);

	const handleAccion = () => {
		accionAlConfirmar();
		setIsOpen(false);
	};

	const handleOpen = () => setIsOpen(!isOpen);

	return (
		<>
			<Dialog open={isOpen} handler={handleOpen} size='xs'>
				<DialogHeader>
					<div className='flex flex-col w-full justify-center gap-5 items-center'>
						<FaCheckCircle size={40} className='text-verdeClaro' /> Finalizado
						correctamente.
					</div>
				</DialogHeader>
				<DialogBody className='flex flex-col text-center gap-3'>
					<Typography variant='lead'>Se completó la operación.</Typography>
				</DialogBody>
				<DialogFooter className='flex justify-center'>
					<Button
						variant='gradient'
						color='light-green'
						onClick={handleAccion}
						className='w-fit'
					>
						<span>Aceptar</span>
					</Button>
				</DialogFooter>
			</Dialog>
		</>
	);
};
