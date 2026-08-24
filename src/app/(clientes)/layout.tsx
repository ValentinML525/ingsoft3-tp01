export default function ClientesLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className='p-4 sm:p-8'>{children}</div>;
}
