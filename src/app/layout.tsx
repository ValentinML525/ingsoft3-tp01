import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Provider } from '../components/provider/Provider';
import { ThemeProviderClient } from './ThemeProviderClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'SERRAHOME',
	description: 'Gestión de Reservas',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='es'>
			<body className={inter.className}>
				<Provider>
					<ThemeProviderClient>{children}</ThemeProviderClient>
				</Provider>
			</body>
		</html>
	);
}
