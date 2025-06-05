import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { 
  getAllTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  claimTask, 
  unclaimTask,
  addComment
} from '$lib/server/todo/api';
import type { User } from '$lib/db/schema';

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

function validateTaskStatus(status: string | undefined): TaskStatus | undefined {
  if (!status) return undefined;
  if (['pending', 'in_progress', 'completed'].includes(status)) {
    return status as TaskStatus;
  }
  return undefined;
}

function validateTaskPriority(priority: string | undefined): TaskPriority | undefined {
  if (!priority) return undefined;
  if (['low', 'medium', 'high'].includes(priority)) {
    return priority as TaskPriority;
  }
  return undefined;
}

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'You must be logged in to view this page');
  }

  // Get all tasks
  const tasks = await getAllTasks();

  return {
    tasks,
    user: locals.user
  };
};

export const actions: Actions = {
  // Create a new task
  createTask: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, 'You must be logged in to create a task');
    }

    const data = await request.formData();
    const title = data.get('title')?.toString();
    const description = data.get('description')?.toString();
    const priority = validateTaskPriority(data.get('priority')?.toString());
    const assignedToId = data.get('assignedToId')?.toString();
    const dueDate = data.get('dueDate')?.toString();

    if (!title) {
      return { success: false, error: 'Title is required' };
    }

    try {
      const task = await createTask({
        title,
        description,
        priority,
        assignedToId: assignedToId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      }, locals.user as User);

      return { success: true, task };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  },

  // Update a task
  updateTask: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, 'You must be logged in to update a task');
    }

    const data = await request.formData();
    const id = data.get('id')?.toString();
    const title = data.get('title')?.toString();
    const description = data.get('description')?.toString();
    const status = validateTaskStatus(data.get('status')?.toString());
    const priority = validateTaskPriority(data.get('priority')?.toString());
    const assignedToId = data.get('assignedToId')?.toString();
    const dueDate = data.get('dueDate')?.toString();

    if (!id) {
      return { success: false, error: 'Task ID is required' };
    }

    try {
      const task = await updateTask(id, {
        title,
        description,
        status,
        priority,
        assignedToId: assignedToId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      }, locals.user as User);

      return { success: true, task };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  },

  // Delete a task
  deleteTask: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, 'You must be logged in to delete a task');
    }

    const data = await request.formData();
    const id = data.get('id')?.toString();

    if (!id) {
      return { success: false, error: 'Task ID is required' };
    }

    try {
      await deleteTask(id, locals.user as User);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  },

  // Claim a task
  claimTask: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, 'You must be logged in to claim a task');
    }

    const data = await request.formData();
    const id = data.get('id')?.toString();

    if (!id) {
      return { success: false, error: 'Task ID is required' };
    }

    try {
      const task = await claimTask(id, locals.user as User);
      return { success: true, task };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  },

  // Unclaim a task
  unclaimTask: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, 'You must be logged in to unclaim a task');
    }

    const data = await request.formData();
    const id = data.get('id')?.toString();

    if (!id) {
      return { success: false, error: 'Task ID is required' };
    }

    try {
      const task = await unclaimTask(id, locals.user as User);
      return { success: true, task };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  },

  // Add a comment to a task
  addComment: async ({ request, locals }) => {
    if (!locals.user) {
      throw error(401, 'You must be logged in to add a comment');
    }

    const data = await request.formData();
    const taskId = data.get('taskId')?.toString();
    const content = data.get('content')?.toString();

    if (!taskId || !content) {
      return { success: false, error: 'Task ID and comment content are required' };
    }

    try {
      const comment = await addComment(taskId, content, locals.user as User);
      return { success: true, comment };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  }
}; 