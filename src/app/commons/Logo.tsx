import Image from 'next/image';

export const Logo = ({ lado }: { lado: number }) => {
	return (
		<div className=''>
			<Image src='/logo.png' alt='Logo' width={lado} height={lado} priority />
		</div>
	);
};
