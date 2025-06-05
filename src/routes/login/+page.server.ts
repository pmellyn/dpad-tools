import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/db';
import * as table from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { verify } from '@node-rs/argon2';
import * as auth from '$lib/server/auth';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString();
		const password = data.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { message: 'Email and password are required' });
		}

		try {
			const result = await db.select().from(table.user).where(eq(table.user.email, email));
			const user = result[0];
			if (!user) {
				return fail(400, { message: 'Invalid email or password' });
			}

			const validPassword = await verify(user.passwordHash, password);
			if (!validPassword) {
				return fail(400, { message: 'Invalid email or password' });
			}

			const token = auth.generateSessionToken();
			const session = await auth.createSession(token, user.id);
			auth.setSessionTokenCookie(cookies, token, session.expiresAt);

			return {
				type: 'success'
			};
		} catch (err) {
			if (err instanceof Response && err.status === 303) {
				throw err;
			}
			return fail(500, { message: 'An error occurred during login' });
		}
	},

	logout: async ({ cookies }) => {
		const token = cookies.get(auth.sessionCookieName);
		if (token) {
			const { session } = await auth.validateSessionToken(token);
			if (session) {
				await auth.invalidateSession(session.id);
			}
		}
		auth.deleteSessionTokenCookie(cookies);
		throw redirect(303, '/login');
	}
};
