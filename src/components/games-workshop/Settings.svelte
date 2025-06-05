<script lang="ts">
	import ModalShell from '$components/ModalShell.svelte';
	import type { GWCategory, GWSubcategory1, GWSubcategory2 } from '$lib/db/schema';
	import * as XLSX from 'xlsx';

	const { onClose } = $props<{ onClose: () => void }>();

	let categories = $state<GWCategory[]>([]);
	let subcategories1 = $state<GWSubcategory1[]>([]);
	let subcategories2 = $state<GWSubcategory2[]>([]);

	// Form state
	let newName = $state('');
	let selectedParentType = $state<'category' | 'subcategory1' | 'subcategory2'>('category');
	let selectedParentId = $state<string | null>(null);
	let showAddForm = $state(false);

	// Editing state
	let editingCategory = $state<GWCategory | null>(null);
	let editingSubcategory1 = $state<GWSubcategory1 | null>(null);
	let editingSubcategory2 = $state<GWSubcategory2 | null>(null);

	// Excel mapping state
	let excelData = $state<any[]>([]);
	let excelCategories = $state<string[]>([]);
	let categoryMappings = $state<Record<string, { type: 'category' | 'subcategory1' | 'subcategory2', id: string }>>({});
	let mappedCategories = $state<Record<string, { type: 'category' | 'subcategory1' | 'subcategory2', id: string, name: string }>>({});

	// Expanded state
	let expandedCategories = $state<Set<string>>(new Set());

	// Editing mapping state
	let editingMapping = $state<string | null>(null);
	let originalMapping = $state<{ type: 'category' | 'subcategory1' | 'subcategory2', id: string, name: string }>({ type: 'category', id: '', name: '' });

	function toggleCategory(categoryId: string) {
		const newSet = new Set(expandedCategories);
		if (newSet.has(categoryId)) {
			newSet.delete(categoryId);
		} else {
			newSet.add(categoryId);
		}
		expandedCategories = newSet;
	}

	async function loadData() {
		const response = await fetch('/games-workshop/settings');
		const data = await response.json();
		categories = data.categories.sort((a: GWCategory, b: GWCategory) => a.name.localeCompare(b.name));
		subcategories1 = data.subcategories1.sort((a: GWSubcategory1, b: GWSubcategory1) => a.name.localeCompare(b.name));
		subcategories2 = data.subcategories2.sort((a: GWSubcategory2, b: GWSubcategory2) => a.name.localeCompare(b.name));
	}

	async function addItem() {
		if (!newName) return;

		switch (selectedParentType) {
			case 'category':
				await fetch('/games-workshop/settings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ type: 'category', data: { name: newName } })
				});
				break;
			case 'subcategory1':
				if (!selectedParentId) return;
				await fetch('/games-workshop/settings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						type: 'subcategory1',
						data: { name: newName, categoryId: selectedParentId }
					})
				});
				break;
			case 'subcategory2':
				if (!selectedParentId) return;
				await fetch('/games-workshop/settings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						type: 'subcategory2',
						data: { name: newName, subcategoryId: selectedParentId }
					})
				});
				break;
		}

		newName = '';
		selectedParentId = null;
		showAddForm = false;
		await loadData();
	}

	async function deleteCategory(id: string) {
		await fetch('/games-workshop/settings', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type: 'category', id })
		});
		await loadData();
	}

	async function deleteSubcategory1(id: string) {
		await fetch('/games-workshop/settings', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type: 'subcategory1', id })
		});
		await loadData();
	}

	async function deleteSubcategory2(id: string) {
		await fetch('/games-workshop/settings', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type: 'subcategory2', id })
		});
		await loadData();
	}

	async function updateCategory(category: GWCategory) {
		await fetch('/games-workshop/settings', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type: 'category', id: category.id, data: { name: category.name } })
		});
		editingCategory = null;
		await loadData();
	}

	async function updateSubcategory1(subcategory: GWSubcategory1) {
		await fetch('/games-workshop/settings', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'subcategory1',
				id: subcategory.id,
				data: { name: subcategory.name, categoryId: subcategory.categoryId }
			})
		});
		editingSubcategory1 = null;
		await loadData();
	}

	async function updateSubcategory2(subcategory: GWSubcategory2) {
		await fetch('/games-workshop/settings', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'subcategory2',
				id: subcategory.id,
				data: { name: subcategory.name, subcategoryId: subcategory.subcategoryId }
			})
		});
		editingSubcategory2 = null;
		await loadData();
	}

	async function handleFileUpload(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = async (e) => {
			const data = new Uint8Array(e.target?.result as ArrayBuffer);
			const workbook = XLSX.read(data, { type: 'array' });
			
			// Get the USA sheet
			const usaSheet = workbook.Sheets['USA'];
			if (!usaSheet) {
				alert('Could not find USA sheet in the Excel file');
				return;
			}

			// Convert to JSON and extract unique races
			const rows = XLSX.utils.sheet_to_json(usaSheet);
			const races = new Set<string>();
			rows.forEach((row: any) => {
				if (row.Race) races.add(row.Race);
			});
			
			// Get current mappings from database
			const response = await fetch('/games-workshop/settings/mappings');
			const currentMappings = await response.json();
			
			// Separate mapped and unmapped categories
			const allCategories = Array.from(races);
			excelCategories = allCategories.filter(cat => !currentMappings[cat]);
			mappedCategories = currentMappings;
		};
		reader.readAsArrayBuffer(file);
	}

	async function saveMappings() {
		try {
			// Save new mappings
			for (const [excelCategory, mapping] of Object.entries(categoryMappings)) {
				if (!mapping) continue; // Skip if no mapping selected
				
				await fetch('/games-workshop/settings/mappings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ excelCategory, mapping })
				});
			}

			// Save updated mappings
			for (const [excelCategory, mapping] of Object.entries(mappedCategories)) {
				if (!mapping) continue; // Skip if no mapping selected
				
				await fetch('/games-workshop/settings/mappings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ excelCategory, mapping })
				});
			}

			// Refresh the data
			await loadData();
			
			// Clear the form
			categoryMappings = {};
			excelCategories = [];
			mappedCategories = {};
		} catch (error) {
			console.error('Error saving mappings:', error);
			alert('Error saving mappings. Please try again.');
		}
	}

	$effect(() => {
		loadData();
	});
</script>

<ModalShell isOpen={true} onClose={onClose}>
	<div class="p-6">
		<h2 class="text-2xl font-bold text-white mb-6">Games Workshop Settings</h2>

		<!-- Category Mapping Section -->
		<div class="mb-8">
			<h3 class="text-xl font-semibold text-white mb-4">Category Mapping</h3>
			<div class="space-y-4">
				<input
					type="file"
					accept=".xlsx,.xls"
					onchange={handleFileUpload}
					class="block w-full text-sm text-gray-300
						file:mr-4 file:py-2 file:px-4
						file:rounded-md file:border-0
						file:text-sm file:font-semibold
						file:bg-blue-600 file:text-white
						hover:file:bg-blue-700"
				/>

				{#if excelCategories.length > 0 || Object.keys(mappedCategories).length > 0}
					<div class="space-y-4">
						{#if excelCategories.length > 0}
							<div class="space-y-4">
								<h4 class="text-lg font-medium text-white">Unmapped Categories</h4>
								{#each excelCategories as excelCategory}
									<div class="flex items-center gap-4">
										<span class="text-white min-w-[200px]">{excelCategory}</span>
										<select
											bind:value={categoryMappings[excelCategory]}
											class="flex-1 px-3 py-2 bg-gray-700 text-white rounded-md"
										>
											<option value={null}>Select mapping</option>
											{#each categories as category}
												<optgroup label={category.name}>
													<option value={{ type: 'category', id: category.id, name: category.name }}>
														{category.name}
													</option>
													{#each subcategories1.filter(s => s.categoryId === category.id) as subcategory}
														<option value={{ type: 'subcategory1', id: subcategory.id, name: subcategory.name }}>
															└─ {subcategory.name}
														</option>
														{#each subcategories2.filter(s => s.subcategoryId === subcategory.id) as subcategory2}
															<option value={{ type: 'subcategory2', id: subcategory2.id, name: subcategory2.name }}>
																&nbsp;&nbsp;&nbsp;└─ {subcategory2.name}
															</option>
														{/each}
													{/each}
												</optgroup>
											{/each}
										</select>
									</div>
								{/each}
							</div>
						{/if}

						{#if Object.keys(mappedCategories).length > 0}
							<div class="space-y-4">
								<h4 class="text-lg font-medium text-white">Mapped Categories</h4>
								{#each Object.entries(mappedCategories) as [excelCategory, mapping]}
									<div class="flex items-center gap-4">
										{#if editingMapping === excelCategory}
											<div class="flex min-w-[200px] max-w-xs w-64 flex-col items-start break-words whitespace-normal">
												<span class="text-white">{excelCategory}</span>
												<div class="flex gap-2 mt-2">
													<button
														type="button"
														onclick={() => {
															editingMapping = null;
															saveMappings();
														}}
														class="px-2.5 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
													>
														Save
													</button>
													<button
														type="button"
														onclick={() => {
															editingMapping = null;
															// Restore original mapping
															mappedCategories[excelCategory] = originalMapping;
														}}
														class="px-2.5 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
													>
														Cancel
													</button>
												</div>
											</div>
											<div class="flex-1 text-white flex flex-col items-start">
												{#if mapping.type === 'category'}
													<div class="font-bold">{mapping.name}</div>
												{:else if mapping.type === 'subcategory1'}
													<div class="font-bold">{categories.find(c => subcategories1.find(s => s.id === mapping.id)?.categoryId === c.id)?.name}</div>
													<div class="ml-6">↳ {mapping.name}</div>
												{:else}
													<div class="font-bold">{categories.find(c => subcategories1.find(s => subcategories2.find(s2 => s2.id === mapping.id)?.subcategoryId === s.id)?.categoryId === c.id)?.name}</div>
													<div class="ml-6">↳ {subcategories1.find(s => subcategories2.find(s2 => s2.id === mapping.id)?.subcategoryId === s.id)?.name}</div>
													<div class="ml-12">↳ {mapping.name}</div>
												{/if}
											</div>
										{:else}
											<div class="flex min-w-[200px] max-w-xs w-64 flex-col items-start break-words whitespace-normal">
												<span class="text-white">{excelCategory}</span>
												<div class="flex gap-2 mt-2">
													<button
														type="button"
														aria-label="Edit mapping"
														onclick={() => {
															editingMapping = excelCategory;
															originalMapping = { ...mapping };
														}}
														class="p-1 rounded-full hover:bg-blue-100 focus:outline-none"
														title="Edit"
													>
														<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
															<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" />
														</svg>
													</button>
													<button
														type="button"
														aria-label="Delete mapping"
														onclick={() => {
															delete mappedCategories[excelCategory];
															saveMappings();
														}}
														class="p-1 rounded-full hover:bg-red-100 focus:outline-none"
														title="Delete"
													>
														<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
															<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												</div>
											</div>
											<div class="flex-1 text-white flex flex-col items-start">
												{#if mapping.type === 'category'}
													<div class="font-bold">{mapping.name}</div>
												{:else if mapping.type === 'subcategory1'}
													<div class="font-bold">{categories.find(c => subcategories1.find(s => s.id === mapping.id)?.categoryId === c.id)?.name}</div>
													<div class="ml-6">↳ {mapping.name}</div>
												{:else}
													<div class="font-bold">{categories.find(c => subcategories1.find(s => subcategories2.find(s2 => s2.id === mapping.id)?.subcategoryId === s.id)?.categoryId === c.id)?.name}</div>
													<div class="ml-6">↳ {subcategories1.find(s => subcategories2.find(s2 => s2.id === mapping.id)?.subcategoryId === s.id)?.name}</div>
													<div class="ml-12">↳ {mapping.name}</div>
												{/if}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}

						<button
							type="button"
							onclick={saveMappings}
							class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
						>
							Save Mappings
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Categories Hierarchy -->
		<div class="mb-8">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-xl font-semibold text-white">Categories</h3>
				<button
					type="button"
					onclick={() => (showAddForm = !showAddForm)}
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					{showAddForm ? 'Cancel' : 'Add New'}
				</button>
			</div>

			{#if showAddForm}
				<div class="bg-gray-800 p-4 rounded-md mb-4">
					<div class="space-y-4">
						<div>
							<label for="type-select" class="block text-white mb-2">Type</label>
							<select
								id="type-select"
								bind:value={selectedParentType}
								class="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
							>
								<option value="category">Category</option>
								<option value="subcategory1">Subcategory 1</option>
								<option value="subcategory2">Subcategory 2</option>
							</select>
						</div>

						{#if selectedParentType !== 'category'}
							<div>
								<label for="parent-select" class="block text-white mb-2">Parent</label>
								<select
									id="parent-select"
									bind:value={selectedParentId}
									class="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
								>
									<option value={null}>Select parent</option>
									{#if selectedParentType === 'subcategory1'}
										{#each categories as category}
											<option value={category.id}>{category.name}</option>
										{/each}
									{:else}
										{#each subcategories1 as subcategory}
											<option value={subcategory.id}>
												{categories.find((c) => c.id === subcategory.categoryId)?.name} - {subcategory.name}
											</option>
										{/each}
									{/if}
								</select>
							</div>
						{/if}

						<div>
							<label for="name-input" class="block text-white mb-2">Name</label>
							<input
								id="name-input"
								type="text"
								bind:value={newName}
								placeholder="Enter name"
								class="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
							/>
						</div>

						<button
							type="button"
							onclick={addItem}
							class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
						>
							Add
						</button>
					</div>
				</div>
			{/if}

			<div class="space-y-2">
				<div class="bg-gray-800 rounded-md overflow-hidden">
					{#each categories as category}
						<div>
							<div class="flex items-center justify-between p-3">
								<div class="flex items-center gap-2">
									<button
										type="button"
										onclick={() => toggleCategory(category.id)}
										class="text-white hover:text-blue-400"
									>
										{expandedCategories.has(category.id) ? '▼' : '▶'}
									</button>
									{#if editingCategory?.id === category.id}
										<input
											type="text"
											bind:value={editingCategory.name}
											class="px-3 py-1.5 bg-gray-700 text-white rounded-md"
										/>
									{:else}
										<span class="text-white font-medium">{category.name}</span>
									{/if}
								</div>
								<div class="flex gap-2">
									{#if editingCategory?.id === category.id}
										<button
											type="button"
											onclick={() => editingCategory && updateCategory(editingCategory)}
											class="px-2.5 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
										>
											Save
										</button>
										<button
											type="button"
											onclick={() => (editingCategory = null)}
											class="px-2.5 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
										>
											Cancel
										</button>
									{:else}
										<button
											type="button"
											onclick={() => (editingCategory = { ...category })}
											class="px-2.5 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
										>
											Edit
										</button>
										<button
											type="button"
											onclick={() => deleteCategory(category.id)}
											class="px-2.5 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
										>
											Delete
										</button>
									{/if}
								</div>
							</div>

							{#if expandedCategories.has(category.id)}
								<div class="bg-gray-700">
									<!-- Mapped Excel categories for this category -->
									{#each Object.entries(mappedCategories).filter(([_, m]) => m.type === 'category' && m.id === category.id) as [excelCategory, mapping]}
										<div class="ml-8 flex items-center gap-2 py-1">
											<span class="text-xs text-white bg-blue-900 rounded px-2 py-1">{excelCategory}</span>
											<button aria-label="Edit mapping" class="p-1 rounded-full hover:bg-blue-100 focus:outline-none" title="Edit" onclick={() => { editingMapping = excelCategory; originalMapping = { ...mapping }; }}>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
											</button>
											<button aria-label="Delete mapping" class="p-1 rounded-full hover:bg-red-100 focus:outline-none" title="Delete" onclick={() => { delete mappedCategories[excelCategory]; saveMappings(); }}>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
											</button>
										</div>
									{/each}
									{#each subcategories1.filter((s) => s.categoryId === category.id) as subcategory}
										<div>
											<div class="flex items-center justify-between p-3">
												<div class="flex items-center gap-2">
													<button
														type="button"
														onclick={() => toggleCategory(subcategory.id)}
														class="text-white hover:text-blue-400"
													>
														{expandedCategories.has(subcategory.id) ? '▼' : '▶'}
													</button>
													{#if editingSubcategory1?.id === subcategory.id}
														<input
															type="text"
															bind:value={editingSubcategory1.name}
															class="px-3 py-1.5 bg-gray-600 text-white rounded-md"
														/>
													{:else}
														<span class="text-white">{subcategory.name}</span>
													{/if}
												</div>
												<div class="flex gap-2">
													{#if editingSubcategory1?.id === subcategory.id}
														<button
															type="button"
															onclick={() => editingSubcategory1 && updateSubcategory1(editingSubcategory1)}
															class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
														>
															Save
														</button>
														<button
															type="button"
															onclick={() => (editingSubcategory1 = null)}
															class="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
														>
															Cancel
														</button>
													{:else}
														<button
															type="button"
															onclick={() => (editingSubcategory1 = { ...subcategory })}
															class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
														>
															Edit
														</button>
														<button
															type="button"
															onclick={() => deleteSubcategory1(subcategory.id)}
															class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
														>
															Delete
														</button>
													{/if}
												</div>
											</div>
											<!-- Mapped Excel categories for this subcategory1 -->
											{#each Object.entries(mappedCategories).filter(([_, m]) => m.type === 'subcategory1' && m.id === subcategory.id) as [excelCategory, mapping]}
												<div class="ml-12 flex items-center gap-2 py-1">
													<span class="text-xs text-white bg-blue-900 rounded px-2 py-1">{excelCategory}</span>
													<button aria-label="Edit mapping" class="p-1 rounded-full hover:bg-blue-100 focus:outline-none" title="Edit" onclick={() => { editingMapping = excelCategory; originalMapping = { ...mapping }; }}>
														<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
													</button>
													<button aria-label="Delete mapping" class="p-1 rounded-full hover:bg-red-100 focus:outline-none" title="Delete" onclick={() => { delete mappedCategories[excelCategory]; saveMappings(); }}>
														<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
													</button>
												</div>
											{/each}
											{#each subcategories2.filter((s) => s.subcategoryId === subcategory.id) as subcategory2}
												<div>
													<div class="flex items-center justify-between p-3">
														{#if editingSubcategory2?.id === subcategory2.id}
															<input
																type="text"
																bind:value={editingSubcategory2.name}
																class="px-3 py-1.5 bg-gray-500 text-white rounded-md"
															/>
														{:else}
															<span class="text-white">{subcategory2.name}</span>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</ModalShell> 