import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkApiKey } from '@/lib/api-key';

/**
 * POST /api/auth/verify
 * Verifica credenciales de usuario. Usado por NextAuth del frontend.
 * Body: { email: string, password: string }
 */
export async function POST(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Email y contraseña son requeridos' },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { email: email.toLowerCase() },
		});

		if (!user) {
			return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
		}

		const passwordMatch = bcrypt.compareSync(password, user.password);
		if (!passwordMatch) {
			return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
		}

		// Retornar usuario sin password
		const { password: _, ...userWithoutPassword } = user;
		return NextResponse.json(userWithoutPassword);
	} catch (error) {
		console.error('Error en /api/auth/verify:', error);
		return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
