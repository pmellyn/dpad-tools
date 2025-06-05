import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import * as table from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import { randomUUID } from 'crypto';
import * as auth from '$lib/server/auth';

type Role = 'Associate' | 'Manager' | 'Administrator';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionToken = cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		throw redirect(303, '/login');
	}

	try {
		const { user } = await auth.validateSessionToken(sessionToken);
		if (!user || user.role !== 'Administrator') {
			throw redirect(303, '/');
		}

		const users = await db.select().from(table.user);
		return { users };
	} catch {
		throw redirect(303, '/login');
	}
};

export const actions = {
	createUser: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString();
		const firstName = data.get('firstName')?.toString();
		const lastName = data.get('lastName')?.toString();
		const password = data.get('password')?.toString();
		const role = data.get('role')?.toString() as Role;

		if (!email || !firstName || !lastName || !password || !role) {
			return fail(400, { message: 'Missing required fields' });
		}

		const passwordHash = await hash(password);

		await db.insert(table.user).values({
			id: randomUUID(),
			email,
			firstName,
			lastName,
			passwordHash,
			role
		});

		return { success: true };
	},

	updateUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const updateData: Partial<typeof table.user.$inferInsert> = {};

		if (!id) {
			return fail(400, { message: 'Missing user ID' });
		}

		const email = data.get('email')?.toString();
		if (email) updateData.email = email;

		const firstName = data.get('firstName')?.toString();
		if (firstName) updateData.firstName = firstName;

		const lastName = data.get('lastName')?.toString();
		if (lastName) updateData.lastName = lastName;

		const password = data.get('password')?.toString();
		if (password) updateData.passwordHash = await hash(password);

		const role = data.get('role')?.toString() as Role | undefined;
		if (role) updateData.role = role;

		await db.update(table.user).set(updateData).where(eq(table.user.id, id));

		return redirect(303, '/settings');
	},

	deleteUser: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { message: 'Missing user ID' });
		}

		await db.delete(table.user).where(eq(table.user.id, id));

		return redirect(303, '/settings');
	}
} satisfies Actions;
