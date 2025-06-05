<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import TaskCard from './TaskCard.svelte';
  import TaskForm from './TaskForm.svelte';
  import TaskDetail from './TaskDetail.svelte';
  import type { FrontendUser } from '$lib/db/schema';
  
  export let data;
  
  let showCreateForm = false;
  let selectedTask: any = null;
  let filterStatus: string = 'all';
  let filterPriority: string = 'all';
  let searchTerm: string = '';
  
  $: user = data.user as FrontendUser;
  $: tasks = data.tasks;
  $: canCreateTask = user && (user.role === 'Administrator' || user.role === 'Manager');
  
  $: filteredTasks = tasks.filter(task => {
    // Filter by status
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    
    // Filter by priority
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    
    // Filter by search term
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  function toggleCreateForm() {
    showCreateForm = !showCreateForm;
    if (showCreateForm) {
      selectedTask = null;
    }
  }
  
  function viewTaskDetail(task: any) {
    selectedTask = task;
    showCreateForm = false;
  }
  
  function closeTaskDetail() {
    selectedTask = null;
  }
</script>

<svelte:head>
  <title>To Do | D Pad Tools</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-100">To Do List</h1>
    
    {#if canCreateTask}
      <button 
        on:click={toggleCreateForm}
        class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        {showCreateForm ? 'Cancel' : 'New Task'}
      </button>
    {/if}
  </div>
  
  {#if showCreateForm}
    <div transition:slide={{ duration: 300 }} class="mb-8 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 class="text-xl font-semibold text-gray-100 mb-4">Create New Task</h2>
      <TaskForm />
    </div>
  {/if}
  
  <div class="mb-6 bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <label for="search" class="block text-sm font-medium text-gray-400 mb-1">Search</label>
        <input
          type="text"
          id="search"
          bind:value={searchTerm}
          placeholder="Search tasks..."
          class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      <div>
        <label for="status" class="block text-sm font-medium text-gray-400 mb-1">Status</label>
        <select
          id="status"
          bind:value={filterStatus}
          class="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <div>
        <label for="priority" class="block text-sm font-medium text-gray-400 mb-1">Priority</label>
        <select
          id="priority"
          bind:value={filterPriority}
          class="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  </div>
  
  {#if selectedTask}
    <div transition:fade={{ duration: 200 }} class="mb-8 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <TaskDetail task={selectedTask} {user} on:close={closeTaskDetail} />
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#if filteredTasks.length === 0}
      <div class="col-span-full text-center py-12 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-xl font-medium">No tasks found</p>
        <p class="mt-2">Try adjusting your filters or create a new task</p>
      </div>
    {:else}
      {#each filteredTasks as task (task.id)}
        <div transition:fade={{ duration: 200 }}>
          <TaskCard 
            {task} 
            {user} 
            on:view={() => viewTaskDetail(task)} 
          />
        </div>
      {/each}
    {/if}
  </div>
</div> 