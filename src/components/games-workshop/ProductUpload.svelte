<script lang="ts">
	const { onClose } = $props<{
		onClose: () => void;
	}>();

	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFile = $state<File | null>(null);

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			selectedFile = input.files[0];
		}
	}

	function handleConfirm() {
		onClose();
	}

	function handleCancel() {
		onClose();
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between border-b border-gray-700 pb-4">
		<h2 class="text-xl font-semibold text-white">Upload Products</h2>
		<button
			type="button"
			class="text-gray-400 hover:text-white"
			onclick={onClose}
			aria-label="Close"
		>
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	</div>

	<div class="space-y-4">
		<div>
			<div class="flex items-center justify-between">
				<label for="file" class="text-sm font-medium text-gray-300"
					>Please select an .xlsx file to continue.</label
				>
				<button
					type="button"
					onclick={triggerFileInput}
					class="inline-flex items-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Browse
				</button>
				<input
					type="file"
					id="file"
					accept=".xlsx"
					bind:this={fileInput}
					onchange={handleFileSelect}
					class="hidden"
				/>
			</div>
			<div class="mt-4">
				{#if selectedFile}
					<div class="rounded-md bg-gray-700/50 p-4">
						<p class="text-sm text-gray-200">Selected File: {selectedFile.name}</p>
					</div>
				{:else}
					<span class="text-sm text-gray-500">No file selected</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
		<button
			type="button"
			onclick={handleConfirm}
			disabled={!selectedFile}
			class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2 sm:text-sm"
		>
			Upload
		</button>
		<button
			type="button"
			onclick={handleCancel}
			class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-base font-medium text-gray-300 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
		>
			Cancel
		</button>
	</div>
</div> 