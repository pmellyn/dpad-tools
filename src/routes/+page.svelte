<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<div class="flex items-start justify-between gap-6">
		<div class="flex-1">
			<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
				Welcome to D-Pad Tools
			</h2>
			<p class="mt-4 text-lg text-gray-300">
				Your all-in-one solution for managing and organizing your work.
			</p>
		</div>

		{#if data.user}
			<div class="rounded-lg bg-gray-800 p-4 shadow-lg ring-1 ring-gray-700">
				<div class="flex items-center gap-x-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
						<span class="text-sm font-semibold text-white"
							>{data.user.firstName[0]}{data.user.lastName[0]}</span
						>
					</div>
					<div>
						<h3 class="text-sm font-semibold text-white">
							{data.user.firstName}
							{data.user.lastName}
						</h3>
						<p class="text-xs text-gray-300">{data.user.email}</p>
						<p class="text-xs font-medium text-blue-400">{data.user.role}</p>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Task Management Card -->
		<div class="rounded-lg bg-gray-800 p-6 shadow-lg ring-1 ring-gray-700">
			<div class="flex items-center gap-x-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
					<svg
						class="h-6 w-6 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-white">Task Management</h3>
			</div>
			<p class="mt-4 text-gray-300">
				Efficiently organize and track your tasks with our intuitive task management system.
			</p>
		</div>

		<!-- Team Collaboration Card -->
		<div class="rounded-lg bg-gray-800 p-6 shadow-lg ring-1 ring-gray-700">
			<div class="flex items-center gap-x-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
					<svg
						class="h-6 w-6 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-white">Team Collaboration</h3>
			</div>
			<p class="mt-4 text-gray-300">
				Work seamlessly with your team members and share resources effectively.
			</p>
		</div>

		<!-- Analytics Card -->
		<div class="rounded-lg bg-gray-800 p-6 shadow-lg ring-1 ring-gray-700">
			<div class="flex items-center gap-x-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
					<svg
						class="h-6 w-6 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-white">Analytics</h3>
			</div>
			<p class="mt-4 text-gray-300">
				Get insights into your team's performance with detailed analytics and reports.
			</p>
		</div>
	</div>
</div>
