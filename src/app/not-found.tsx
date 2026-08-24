import Link from 'next/link';

export default function NotFound() {
	return (
		<div className='flex'>
			<div className='h-screen w-full flex flex-col justify-center items-center bg-white'>
				<h1 className='text-9xl font-extrabold text-oscuro tracking-widest'>
					404
				</h1>
				<div className='bg-naranja px-2 text-sm rounded rotate-12 absolute'>
					Página No Encontrada
				</div>
				<button className='mt-5'>
					<div className='relative inline-block text-sm font-medium text-oscuro group active:text-white focus:outline-none focus:ring'>
						<span className='absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-oscuro group-hover:translate-y-0 group-hover:translate-x-0'></span>

						<span className='relative block px-8 py-3 bg-naranja border border-current'>
							<Link href='/resultados'>Volver al Inicio</Link>
						</span>
					</div>
				</button>
			</div>
		</div>
	);
}
