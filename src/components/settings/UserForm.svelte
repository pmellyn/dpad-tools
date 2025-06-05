<script lang="ts">
	type User = {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: 'Administrator' | 'Manager' | 'Associate';
	};

	const { user, onClose, onSave } = $props<{
		user: User;
		onClose: () => void;
		onSave: (user: User, password?: string) => void;
	}>();

	let firstName = $state(user.firstName);
	let lastName = $state(user.lastName);
	let email = $state(user.email);
	let role = $state(user.role);
	let password = $state('');
	let errors = $state<Record<string, string>>({});

	const validateForm = () => {
		errors = {};
		if (!firstName.trim()) {
			errors.firstName = 'First name is required';
		}
		if (!lastName.trim()) {
			errors.lastName = 'Last name is required';
		}
		if (!email.trim()) {
			errors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Invalid email format';
		}
		if (!user.id && !password) {
			errors.password = 'Password is required for new users';
		}
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		if (validateForm()) {
			onSave({
				...user,
				firstName,
				lastName,
				email,
				role
			}, password);
		}
	};

	const handleClose = () => {
		onClose();
	};

	// Reset form when user changes
	$effect(() => {
		firstName = user.firstName;
		lastName = user.lastName;
		email = user.email;
		role = user.role;
		password = '';
		errors = {};
	});
</script>

<form onsubmit={handleSubmit} class="space-y-4" novalidate>
	<div>
		<label for="firstName" class="block text-sm font-medium text-gray-300">First Name</label>
		<input
			type="text"
			id="firstName"
			bind:value={firstName}
			class="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
			required
			aria-invalid={!!errors.firstName}
			aria-describedby={errors.firstName ? 'firstName-error' : undefined}
		/>
		{#if errors.firstName}
			<p id="firstName-error" class="mt-1 text-sm text-red-500" role="alert">{errors.firstName}</p>
		{/if}
	</div>

	<div>
		<label for="lastName" class="block text-sm font-medium text-gray-300">Last Name</label>
		<input
			type="text"
			id="lastName"
			bind:value={lastName}
			class="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
			required
			aria-invalid={!!errors.lastName}
			aria-describedby={errors.lastName ? 'lastName-error' : undefined}
		/>
		{#if errors.lastName}
			<p id="lastName-error" class="mt-1 text-sm text-red-500" role="alert">{errors.lastName}</p>
		{/if}
	</div>

	<div>
		<label for="email" class="block text-sm font-medium text-gray-300">Email</label>
		<input
			type="email"
			id="email"
			bind:value={email}
			class="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
			required
			aria-invalid={!!errors.email}
			aria-describedby={errors.email ? 'email-error' : undefined}
			autocomplete="username"
		/>
		{#if errors.email}
			<p id="email-error" class="mt-1 text-sm text-red-500" role="alert">{errors.email}</p>
		{/if}
	</div>

	<div>
		<label for="password" class="block text-sm font-medium text-gray-300">
			{user.id ? 'New Password (Optional)' : 'Password'}
		</label>
		<input
			type="password"
			id="password"
			bind:value={password}
			class="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
			required={!user.id}
			aria-invalid={!!errors.password}
			aria-describedby={errors.password ? 'password-error' : undefined}
			autocomplete={user.id ? 'new-password' : 'new-password'}
		/>
		{#if errors.password}
			<p id="password-error" class="mt-1 text-sm text-red-500" role="alert">{errors.password}</p>
		{/if}
	</div>

	<div>
		<label for="role" class="block text-sm font-medium text-gray-300">Role</label>
		<select
			id="role"
			bind:value={role}
			class="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
			aria-label="Select user role"
		>
			<option value="Administrator">Administrator</option>
			<option value="Manager">Manager</option>
			<option value="Associate">Associate</option>
		</select>
	</div>

	<div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
		<button
			type="submit"
			class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
		>
			Save
		</button>
		<button
			type="button"
			onclick={handleClose}
			class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-base font-medium text-gray-300 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
		>
			Cancel
		</button>
	</div>
</form> 