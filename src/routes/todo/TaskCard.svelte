<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { enhance } from '$app/forms';
  import type { TodoTask } from '$lib/db/schema';
  import type { FrontendUser } from '$lib/db/schema';
  
  export let task: TodoTask;
  export let user: FrontendUser;
  
  const dispatch = createEventDispatcher();
  
  $: canModifyTask = user && (user.role === 'Administrator' || user.role === 'Manager');
  $: canClaimTask = user && !task.claimedById && task.status !== 'completed';
  $: canUnclaimTask = user && task.claimedById === user.id;
  
  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }
  
  function formatDate(date: Date | null) {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  }
</script>

<div class="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700 hover:border-purple-500 transition-colors duration-200">
  <div class="flex justify-between items-start mb-3">
    <h3 class="text-lg font-semibold text-gray-100">{task.title}</h3>
    <div class="flex gap-2">
      <span class={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
        {task.priority}
      </span>
      <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
        {task.status.replace('_', ' ')}
      </span>
    </div>
  </div>
  
  {#if task.description}
    <p class="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
  {/if}
  
  <div class="flex flex-wrap gap-2 mb-3">
    {#if task.assignedTo}
      <span class="text-sm text-gray-400">
        Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}
      </span>
    {/if}
    {#if task.claimedBy}
      <span class="text-sm text-gray-400">
        Claimed by: {task.claimedBy.firstName} {task.claimedBy.lastName}
      </span>
    {/if}
  </div>
  
  <div class="flex justify-between items-center">
    <span class="text-sm text-gray-400">
      Due: {formatDate(task.dueDate)}
    </span>
    
    <div class="flex gap-2">
      {#if canClaimTask}
        <form action="?/claimTask" method="POST" use:enhance>
          <input type="hidden" name="taskId" value={task.id} />
          <button
            type="submit"
            class="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors duration-200"
          >
            Claim
          </button>
        </form>
      {/if}
      
      {#if canUnclaimTask}
        <form action="?/unclaimTask" method="POST" use:enhance>
          <input type="hidden" name="taskId" value={task.id} />
          <button
            type="submit"
            class="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors duration-200"
          >
            Unclaim
          </button>
        </form>
      {/if}
      
      <button
        on:click={() => dispatch('view')}
        class="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors duration-200"
      >
        View
      </button>
    </div>
  </div>
</div> 