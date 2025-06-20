import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';

// Validate required environment variables
const requiredEnvVars = [
	'DATABASE_URL',
	'SESSION_SECRET',
	'JWT_SECRET'
];

if (!dev) {
	for (const envVar of requiredEnvVars) {
		if (!process.env[envVar]) {
			throw new Error(`Missing required environment variable: ${envVar}`);
		}
	}
}

const handleAuth: Handle = async ({ event, resolve }) => {
	// Ignore Chrome DevTools route
	if (event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response('Not Found', { status: 404 });
	}

	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event.cookies);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle = sequence(handleAuth);
