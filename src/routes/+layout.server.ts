import type { LayoutServerLoad } from './$types';
import * as auth from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const sessionToken = cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		return {
			user: null
		};
	}

	try {
		const { user } = await auth.validateSessionToken(sessionToken);
		return {
			user
		};
	} catch {
		auth.deleteSessionTokenCookie(cookies);
		return {
			user: null
		};
	}
};
