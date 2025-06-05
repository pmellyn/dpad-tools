<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import TcgTradeModal from '$components/tcg-trade/TcgTradeModal.svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<svelte:head>
	<title>D-Pad Tools</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gray-900">
	{#if $page.url.pathname !== '/login'}
		<header class="bg-gray-800 shadow">
			<nav class="mx-auto flex max-w-7xl items-center justify-between p-4">
				<a href="/" class="text-xl font-bold text-white">D-Pad Tools</a>
				<div class="flex items-center gap-4">
					{#if data.user}
						<a
							href="/"
							class="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
						>
							Home
						</a>
						<a
							href="/tcg-trade"
							class="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
						>
							TCG Trade-In
						</a>
						<a
							href="/games-workshop"
							class="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
						>
							Games Workshop
						</a>
						{#if data.user.role === 'Administrator'}
							<a
								href="/settings"
								class="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
							>
								Settings
							</a>
						{/if}
						<form method="post" action="/login?/logout" use:enhance>
							<button
								type="submit"
								class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
							>
								Logout
							</button>
						</form>
					{:else}
						<a
							href="/login"
							class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
						>
							Login
						</a>
					{/if}
				</div>
			</nav>
		</header>
	{/if}
	<main class="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4">
		{@render children()}
	</main>
</div>