import { auth } from '@/auth.config';
import { Sidebar } from '../../components/Dashboard/Sidebar';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session?.user) {
		// redirect('/auth/login?returnTo=/perfil');
		redirect('/auth/login?redirectTo=/dashboard/home');
	}
	return (
		<div className='bg-slate-100 overflow-y-scroll w-screen h-screen antialiased text-slate-300'>
			<div className='flex w-full h-full'>
				<Sidebar />
				<div className='ml-auto mb-6 lg:w-[75%] xl:w-[80%] 2xl:w-[85%] min-h-screen'>
					<div className='p-10 w-full h-full'>{children}</div>
				</div>
			</div>
		</div>
	);
}
