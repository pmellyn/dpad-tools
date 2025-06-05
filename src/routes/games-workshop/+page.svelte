<script lang="ts">
	import type { PageData } from './$types';
	import ModalShell from '$components/ModalShell.svelte';
	import ProductUpload from '$components/games-workshop/ProductUpload.svelte';
	import Settings from '$components/games-workshop/Settings.svelte';

	const { data } = $props<{ data: PageData }>();

	let showUploadModal = $state(false);
	let showSettingsModal = $state(false);

	function handleOpenUpload() {
		showUploadModal = true;
	}

	function handleCloseUpload() {
		showUploadModal = false;
	}

	function handleOpenSettings() {
		showSettingsModal = true;
	}

	function handleCloseSettings() {
		showSettingsModal = false;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-2xl font-bold text-white">Games Workshop Product Catalog</h1>
		<div class="flex items-center gap-4">
			<button
				type="button"
				onclick={handleOpenUpload}
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			>
				Upload Products
			</button>
			{#if data.user?.role === 'Administrator'}
				<button
					type="button"
					onclick={handleOpenSettings}
					class="inline-flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
					title="Settings"
					aria-label="Settings"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
</div>

{#if showUploadModal}
	<ModalShell isOpen={true} onClose={handleCloseUpload}>
		{@const props = { close: handleCloseUpload }}
		<ProductUpload onClose={props.close} />
	</ModalShell>
{/if}

{#if showSettingsModal}
	<Settings onClose={handleCloseSettings} />
{/if} 