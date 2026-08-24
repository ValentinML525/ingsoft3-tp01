import { auth } from '@/auth.config';
import { redirect } from 'next/navigation';
import {
	Card,
	CardHeader,
	CardBody,
	Typography,
} from '../../../components/Client/MaterialTailwindClient';

export default async function ProfilePage() {
	const session = await auth();

	if (!session?.user) {
		redirect('/');
	}

	return (
		<div className='flex flex-col min-h-screen items-center'>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>
				Perfil del usuario
			</h1>

			<Card className='max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden'>
				<CardHeader className='bg-verdeIntermedio pt-10 pb-3'>
					<Typography variant='h5' color='white' className='text-center'>
						{session.user.name}
					</Typography>
				</CardHeader>
				<CardBody className='p-6'>
					<div className='flex flex-col space-y-4'>
						<div>
							<Typography variant='h7' color='gray' className='font-medium'>
								Correo Electrónico:
							</Typography>
							<Typography variant='h7' color='black'>
								{session.user.email}
							</Typography>
						</div>
						<div>
							<Typography variant='h7' color='gray' className='font-medium'>
								Rol:
							</Typography>
							<Typography variant='h7' color='black'>
								{session.user.role}
							</Typography>
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
