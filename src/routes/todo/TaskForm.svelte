<script lang="ts">
  import { enhance } from '$app/forms';
  import type { User } from '$lib/db/schema';
  
  export let task: any = null;
  export let users: User[] = [];
  
  let title = task?.title || '';
  let description = task?.description || '';
  let status = task?.status || 'pending';
  let priority = task?.priority || 'medium';
  let assignedToId = task?.assignedToId || '';
  let dueDate = task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
  
  $: isEditMode = !!task;
</script>

<form
  action={isEditMode ? '?/updateTask' : '?/createTask'}
  method="POST"
  use:enhance
  class="space-y-4"
>
  {#if isEditMode}
    <input type="hidden" name="taskId" value={task.id} />
  {/if}
  
  <div>
    <label for="title" class="block text-sm font-medium text-gray-400 mb-1">Title</label>
    <input
      type="text"
      id="title"
      name="title"
      bind:value={title}
      required
      class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>
  
  <div>
    <label for="description" class="block text-sm font-medium text-gray-400 mb-1">Description</label>
    <textarea
      id="description"
      name="description"
      bind:value={description}
      rows="3"
      class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
    ></textarea>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label for="status" class="block text-sm font-medium text-gray-400 mb-1">Status</label>
      <select
        id="status"
        name="status"
        bind:value={status}
        class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
    
    <div>
      <label for="priority" class="block text-sm font-medium text-gray-400 mb-1">Priority</label>
      <select
        id="priority"
        name="priority"
        bind:value={priority}
        class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label for="assignedTo" class="block text-sm font-medium text-gray-400 mb-1">Assign To</label>
      <select
        id="assignedTo"
        name="assignedToId"
        bind:value={assignedToId}
        class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Unassigned</option>
        {#each users as user}
          <option value={user.id}>
            {user.firstName} {user.lastName}
          </option>
        {/each}
      </select>
    </div>
    
    <div>
      <label for="dueDate" class="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
      <input
        type="date"
        id="dueDate"
        name="dueDate"
        bind:value={dueDate}
        class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  </div>
  
  <div class="flex justify-end gap-3">
    <button
      type="submit"
      class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
    >
      {isEditMode ? 'Update Task' : 'Create Task'}
    </button>
  </div>
</form> 