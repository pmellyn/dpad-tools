<script lang="ts">
	import UserForm from '$components/settings/UserForm.svelte';
	import DeleteConfirm from '$components/settings/DeleteConfirm.svelte';
	import ModalShell from '$components/ModalShell.svelte';
	import type { PageData } from './$types';
	import type { User } from '$lib/db/schema';

	const { data } = $props<{ data: PageData }>();

	let showAddUserModal = $state(false);
	let showEditUserModal = $state(false);
	let showDeleteModal = $state(false);
	let selectedUser = $state<User | null>(null);

	const handleAddUser = () => {
		selectedUser = null;
		showAddUserModal = true;
	};

	const handleEditUser = (user: User) => {
		selectedUser = user;
		showEditUserModal = true;
	};

	const handleDeleteUser = (user: User) => {
		selectedUser = user;
		showDeleteModal = true;
	};

	const handleCloseModals = () => {
		showAddUserModal = false;
		showEditUserModal = false;
		showDeleteModal = false;
		selectedUser = null;
	};

	const handleDeleteConfirm = () => {
		if (!selectedUser) return;

		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/deleteUser';

		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'id';
		input.value = selectedUser.id;

		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	};

	async function handleSaveUser(user: { id: string; firstName: string; lastName: string; email: string; role: 'Administrator' | 'Manager' | 'Associate' }, password?: string) {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = user.id ? '?/updateUser' : '?/createUser';

		Object.entries(user).forEach(([key, value]) => {
			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = key;
			input.value = value;
			form.appendChild(input);
		});

		if (password) {
			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'password';
			input.value = password;
			form.appendChild(input);
		}

		document.body.appendChild(form);
		form.submit();
	}

	// Reset modals when route changes
	$effect(() => {
		handleCloseModals();
	});
</script>

<svelte:head>
	<title>D-Pad Tools - Settings</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">Settings</h1>
		<button
			type="button"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
			onclick={handleAddUser}
		>
			Add User
		</button>
	</div>

	<div class="overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow">
		<table class="min-w-full divide-y divide-gray-700">
			<thead class="bg-gray-700">
				<tr>
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
					>
						Name
					</th>
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
					>
						Email
					</th>
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
					>
						Role
					</th>
					<th scope="col" class="relative px-6 py-3">
						<span class="sr-only">Actions</span>
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-700 bg-gray-800">
				{#each data.users as user (user.id)}
					<tr>
						<td class="whitespace-nowrap px-6 py-4">
							<div class="text-sm text-white">
								{user.firstName} {user.lastName}
							</div>
						</td>
						<td class="whitespace-nowrap px-6 py-4">
							<div class="text-sm text-gray-300">{user.email}</div>
						</td>
						<td class="whitespace-nowrap px-6 py-4">
							<div class="text-sm text-gray-300">{user.role}</div>
						</td>
						<td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
							<button
								type="button"
								class="text-blue-400 hover:text-blue-300"
								onclick={() => handleEditUser(user)}
							>
								Edit
							</button>
							<button
								type="button"
								class="ml-4 text-red-400 hover:text-red-300"
								onclick={() => handleDeleteUser(user)}
							>
								Delete
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if showAddUserModal}
	<ModalShell isOpen={true} onClose={handleCloseModals}>
		{@const props = { close: handleCloseModals }}
		<UserForm
			user={{
				id: '',
				firstName: '',
				lastName: '',
				email: '',
				role: 'Associate'
			}}
			onClose={props.close}
			onSave={(user, password) => {
				handleSaveUser(user, password);
				props.close();
			}}
		/>
	</ModalShell>
{/if}

{#if showEditUserModal && selectedUser}
	<ModalShell isOpen={true} onClose={handleCloseModals}>
		{@const props = { close: handleCloseModals }}
		<UserForm
			user={{
				...selectedUser,
				role: selectedUser.role as 'Administrator' | 'Manager' | 'Associate'
			}}
			onClose={props.close}
			onSave={(user, password) => {
				handleSaveUser(user, password);
				props.close();
			}}
		/>
	</ModalShell>
{/if}

{#if showDeleteModal && selectedUser}
	<ModalShell isOpen={true} onClose={handleCloseModals}>
		{@const props = { close: handleCloseModals }}
		<DeleteConfirm
			title="Delete User"
			message={`Are you sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}? This action cannot be undone.`}
			onClose={props.close}
			onConfirm={() => {
				handleDeleteConfirm();
				props.close();
			}}
		/>
	</ModalShell>
{/if}
