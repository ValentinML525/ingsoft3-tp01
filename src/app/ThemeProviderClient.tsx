'use client';

import { ThemeProvider } from '@/components/Client/MaterialTailwindClient';
import theme from './theme';

export const ThemeProviderClient = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return <ThemeProvider value={theme}>{children}</ThemeProvider>;
};
