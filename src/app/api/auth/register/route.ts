import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { checkApiKey } from '@/lib/api-key';

/**
 * POST /api/auth/register
 * Crea un nuevo usuario.
 * Body: { name: string, email: string, password: string }
 */
export async function POST(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const { name, email, password } = await request.json();

		if (!name || !email || !password) {
			return NextResponse.json(
				{ error: 'Nombre, email y contraseña son requeridos' },
				{ status: 400 }
			);
		}

		const user = await prisma.user.create({
			data: {
				name,
				email: email.toLowerCase(),
				password: bcryptjs.hashSync(password),
			},
			select: {
				id: true,
				name: true,
				email: true,
			},
		});

		return NextResponse.json({ ok: true, user, message: 'Usuario creado' });
	} catch (error: any) {
		console.error('Error en /api/auth/register:', error);
		// Código de error de unique constraint en Prisma
		if (error?.code === 'P2002') {
			return NextResponse.json(
				{ ok: false, message: 'El email ya está registrado' },
				{ status: 409 }
			);
		}
		return NextResponse.json(
			{ ok: false, message: 'No se pudo crear el usuario' },
			{ status: 500 }
		);
	}
}
