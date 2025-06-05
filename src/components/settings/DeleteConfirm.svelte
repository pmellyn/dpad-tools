<script lang="ts">
	const { title = 'Confirm Delete', message = 'Are you sure you want to delete this item?', onClose, onConfirm } = $props<{
		title?: string;
		message?: string;
		onClose: () => void;
		onConfirm: () => void;
	}>();

	const handleConfirm = () => {
		onConfirm();
	};

	const handleClose = () => {
		onClose();
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			handleClose();
		} else if (e.key === 'Enter' && e.target instanceof HTMLElement && e.target.matches('button')) {
			e.target.click();
		}
	};
</script>

<div
	class="space-y-4"
	role="dialog"
	aria-labelledby="delete-title"
	aria-describedby="delete-message"
	onkeydown={handleKeydown}
	tabindex="0"
>
	<div class="flex items-center justify-between border-b border-gray-700 pb-4">
		<h2 id="delete-title" class="text-xl font-semibold text-white">{title}</h2>
		<button
			type="button"
			class="text-gray-400 hover:text-white"
			onclick={handleClose}
			aria-label="Close"
		>
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<p id="delete-message" class="text-gray-300">{message}</p>

	<div class="flex justify-end space-x-3 pt-4">
		<button
			type="button"
			class="modal-button modal-button-secondary"
			onclick={handleClose}
			aria-label="Cancel deletion"
		>
			Cancel
		</button>
		<button
			type="button"
			class="modal-button modal-button-danger"
			onclick={handleConfirm}
			aria-label="Confirm deletion"
		>
			Delete
		</button>
	</div>
</div> 