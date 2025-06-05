<script lang="ts">
	const { isOpen = false, children, title = 'Settings', onClose } = $props<{
		isOpen?: boolean;
		children: (props: { close: () => void }) => any;
		title?: string;
		onClose: () => void;
	}>();

	const handleClose = () => {
		onClose();
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') handleClose();
	};

	const handleClick = (e: MouseEvent) => {
		e.stopPropagation();
	};

	// Cleanup effect when component is destroyed
	$effect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			// Add global escape key listener
			window.addEventListener('keydown', handleKeydown);
			return () => {
				document.body.style.overflow = '';
				window.removeEventListener('keydown', handleKeydown);
			};
		}
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
		onclick={handleClose}
		onkeydown={handleKeydown}
	>
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				tabindex="0"
				class="relative transform overflow-hidden rounded-lg bg-gray-900 border border-gray-700 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
				onclick={handleClick}
				onkeydown={handleKeydown}
			>
				<h2 id="modal-title" class="sr-only">{title}</h2>
				{@render children({ close: handleClose })}
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.modal-input),
	:global(input),
	:global(select),
	:global(textarea) {
		background-color: rgb(31, 41, 55);
		border: 1px solid rgb(55, 65, 81);
		color: white;
		border-radius: 0.375rem;
		padding: 0.5rem 0.75rem;
		width: 100%;
	}

	:global(.modal-input:focus),
	:global(input:focus),
	:global(select:focus),
	:global(textarea:focus) {
		outline: none;
		box-shadow: 0 0 0 2px rgb(59, 130, 246);
		border-color: transparent;
	}

	:global(.modal-button) {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	:global(.modal-button-primary) {
		background-color: rgb(37, 99, 235);
		color: white;
	}

	:global(.modal-button-secondary) {
		background-color: rgb(55, 65, 81);
		color: white;
	}

	:global(.modal-button-danger) {
		background-color: rgb(220, 38, 38);
		color: white;
	}
</style> 