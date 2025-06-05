<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		
		try {
			const response = await fetch('/login?/login', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success') {
				window.location.href = '/';
			} else if (result.type === 'error') {
				form = { message: result.error?.message || 'An error occurred' };
			} else if (result.type === 'failure') {
				form = { message: result.data?.message || 'Invalid email or password' };
			}
		} catch (err) {
			console.error('Login error:', err);
			form = { message: 'An error occurred during login' };
		}
	}
</script>

<svelte:head>
	<title>D-Pad Tools - Login</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<div class="w-full max-w-sm rounded-lg bg-gray-800 p-6 shadow">
		<h1 class="mb-6 text-center text-2xl font-bold text-white">D-Pad Tools</h1>
		<form
			method="POST"
			onsubmit={handleSubmit}
			class="space-y-4"
		>
			<div>
				<label for="email" class="block text-sm font-medium text-gray-300">Email</label>
				<input
					type="email"
					name="email"
					id="email"
					autocomplete="username"
					required
					class="mt-1 block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
				/>
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-gray-300">Password</label>
				<input
					type="password"
					name="password"
					id="password"
					autocomplete="current-password"
					required
					class="mt-1 block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
				/>
			</div>
			{#if form?.message}
				<p class="text-sm text-red-500">{form.message}</p>
			{/if}
			<button
				type="submit"
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
			>
				Log In
			</button>
		</form>
	</div>
</div>
