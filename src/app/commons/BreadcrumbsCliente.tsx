'use client';
import { Breadcrumbs } from '@/components/Client/MaterialTailwindClient';
import Link from 'next/link';

interface Link {
	titulo: string;
	url: string;
}

interface Props {
	links: Link[];
	nombreSeccionActual: string;
}

export function BreadcrumbsCliente({ links, nombreSeccionActual }: Props) {
	return (
		<Breadcrumbs>
			{links.map((link, index) => (
				<Link
					key={index}
					className='opacity-60 hover:text-verdeIntermedio'
					href={link.url}
					title={link.titulo}
				>
					{link.titulo}
				</Link>
			))}
			<Link href='#' className='hover:text-verdeIntermedio'>
				{nombreSeccionActual}
			</Link>
		</Breadcrumbs>
	);
}
