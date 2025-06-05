<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { enhance } from '$app/forms';
  import type { TodoTask, TodoComment, FrontendUser } from '$lib/db/schema';
  import TaskForm from './TaskForm.svelte';
  
  interface TaskWithRelations extends TodoTask {
    assignedTo: FrontendUser | null;
    createdBy: FrontendUser;
    claimedBy: FrontendUser | null;
    comments: (TodoComment & { user: FrontendUser })[];
  }
  
  export let task: TaskWithRelations;
  export let user: FrontendUser;
  
  const dispatch = createEventDispatcher();
  
  let newComment = '';
  let showEditForm = false;
  
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
  
  function formatDateTime(date: Date) {
    return new Date(date).toLocaleString();
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-start">
    <div>
      <h2 class="text-2xl font-bold text-gray-100">{task.title}</h2>
      <div class="flex gap-2 mt-2">
        <span class={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
    </div>
    
    <div class="flex gap-2">
      {#if canModifyTask}
        <button
          on:click={() => showEditForm = !showEditForm}
          class="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors duration-200"
        >
          {showEditForm ? 'Cancel Edit' : 'Edit Task'}
        </button>
        
        <form action="?/deleteTask" method="POST" use:enhance>
          <input type="hidden" name="taskId" value={task.id} />
          <button
            type="submit"
            class="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors duration-200"
          >
            Delete
          </button>
        </form>
      {/if}
      
      <button
        on:click={() => dispatch('close')}
        class="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors duration-200"
      >
        Close
      </button>
    </div>
  </div>
  
  {#if showEditForm}
    <div class="bg-gray-700 rounded-lg p-4">
      <TaskForm {task} />
    </div>
  {:else}
    <div class="space-y-4">
      {#if task.description}
        <div>
          <h3 class="text-sm font-medium text-gray-400 mb-1">Description</h3>
          <p class="text-gray-200 whitespace-pre-wrap">{task.description}</p>
        </div>
      {/if}
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="text-sm font-medium text-gray-400 mb-1">Assigned To</h3>
          <p class="text-gray-200">
            {#if task.assignedTo}
              {task.assignedTo.firstName} {task.assignedTo.lastName}
            {:else}
              Unassigned
            {/if}
          </p>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-400 mb-1">Due Date</h3>
          <p class="text-gray-200">{formatDate(task.dueDate)}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="text-sm font-medium text-gray-400 mb-1">Created By</h3>
          <p class="text-gray-200">
            {task.createdBy.firstName} {task.createdBy.lastName}
          </p>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-400 mb-1">Created At</h3>
          <p class="text-gray-200">{formatDateTime(task.createdAt)}</p>
        </div>
      </div>
      
      {#if task.claimedBy}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-400 mb-1">Claimed By</h3>
            <p class="text-gray-200">
              {task.claimedBy.firstName} {task.claimedBy.lastName}
            </p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-400 mb-1">Claimed At</h3>
            <p class="text-gray-200">{formatDateTime(task.updatedAt)}</p>
          </div>
        </div>
      {/if}
    </div>
  {/if}
  
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-100">Comments</h3>
      
      <div class="flex gap-2">
        {#if canClaimTask}
          <form action="?/claimTask" method="POST" use:enhance>
            <input type="hidden" name="taskId" value={task.id} />
            <button
              type="submit"
              class="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors duration-200"
            >
              Claim Task
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
              Unclaim Task
            </button>
          </form>
        {/if}
      </div>
    </div>
    
    <form action="?/addComment" method="POST" use:enhance class="space-y-2">
      <input type="hidden" name="taskId" value={task.id} />
      <textarea
        name="content"
        bind:value={newComment}
        placeholder="Add a comment..."
        rows="2"
        class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
      ></textarea>
      <div class="flex justify-end">
        <button
          type="submit"
          class="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors duration-200"
        >
          Add Comment
        </button>
      </div>
    </form>
    
    <div class="space-y-4">
      {#each task.comments as comment (comment.id)}
        <div class="bg-gray-700 rounded-lg p-4">
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="text-gray-200 font-medium">
                {comment.user.firstName} {comment.user.lastName}
              </p>
              <p class="text-sm text-gray-400">
                {formatDateTime(comment.createdAt)}
              </p>
            </div>
          </div>
          <p class="text-gray-200 whitespace-pre-wrap">{comment.content}</p>
        </div>
      {/each}
    </div>
  </div>
</div> 