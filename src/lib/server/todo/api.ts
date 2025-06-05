import { db } from '$lib/db';
import { todoTask, todoComment } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { User } from '$lib/db/schema';

// Helper function to check if user can modify tasks
function canModifyTask(user: User) {
	return user.role === 'Administrator' || user.role === 'Manager';
}

// Get all tasks
export async function getAllTasks() {
	return await db.query.todoTask.findMany({
		with: {
			createdBy: true,
			assignedTo: true,
			claimedBy: true,
			comments: {
				with: {
					user: true
				}
			}
		},
		orderBy: (task) => task.createdAt
	});
}

// Get a specific task by ID
export async function getTaskById(id: string) {
	const task = await db.query.todoTask.findFirst({
		where: eq(todoTask.id, id),
		with: {
			createdBy: true,
			assignedTo: true,
			claimedBy: true,
			comments: {
				with: {
					user: true
				}
			}
		}
	});

	if (!task) {
		throw new Error('Task not found');
	}

	return task;
}

// Create a new task (Admin/Manager only)
export async function createTask(taskData: { title: string; description?: string; status?: string; priority?: string; assignedToId?: string; dueDate?: string }, currentUser: User) {
	if (!canModifyTask(currentUser)) {
		throw error(403, 'You do not have permission to create tasks');
	}

	const [task] = await db.insert(todoTask).values({
		title: taskData.title,
		description: taskData.description || null,
		status: (taskData.status || 'pending') as 'pending' | 'in_progress' | 'completed',
		priority: (taskData.priority || 'medium') as 'low' | 'medium' | 'high',
		assignedToId: taskData.assignedToId || null,
		createdById: currentUser.id,
		dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null
	}).returning();

	return task;
}

// Update a task
export async function updateTask(id: string, taskData: Partial<{ title: string; description: string; status: 'pending' | 'in_progress' | 'completed'; priority: 'low' | 'medium' | 'high'; assignedToId: string; dueDate: string }>, currentUser: User) {
	const task = await getTaskById(id);

	if (!canModifyTask(currentUser) && currentUser.id !== task.claimedById) {
		throw error(403, 'You do not have permission to update this task');
	}

	let filteredData: Partial<typeof todoTask.$inferInsert> = {};
	if (taskData.title) filteredData.title = taskData.title;
	if (taskData.description) filteredData.description = taskData.description;
	if (taskData.status) filteredData.status = taskData.status;
	if (taskData.priority) filteredData.priority = taskData.priority;
	if (taskData.assignedToId) filteredData.assignedToId = taskData.assignedToId;
	if (taskData.dueDate) filteredData.dueDate = new Date(taskData.dueDate);

	if (!canModifyTask(currentUser)) {
		// Associates can only update status
		filteredData = {
			status: taskData.status
		};
	}

	const [updatedTask] = await db.update(todoTask)
		.set({
			...filteredData,
			updatedAt: new Date()
		})
		.where(eq(todoTask.id, id))
		.returning();

	return updatedTask;
}

// Delete a task (Admin/Manager only)
export async function deleteTask(id: string, currentUser: User) {
	if (!canModifyTask(currentUser)) {
		throw error(403, 'You do not have permission to delete tasks');
	}

	// Delete all comments first
	await db.delete(todoComment).where(eq(todoComment.taskId, id));

	// Then delete the task
	await db.delete(todoTask).where(eq(todoTask.id, id));
}

// Claim a task
export async function claimTask(id: string, currentUser: User) {
	const task = await getTaskById(id);

	if (task.claimedById) {
		throw error(400, 'Task is already claimed');
	}

	const [updatedTask] = await db.update(todoTask)
		.set({
			claimedById: currentUser.id,
			updatedAt: new Date()
		})
		.where(eq(todoTask.id, id))
		.returning();

	return updatedTask;
}

// Unclaim a task
export async function unclaimTask(id: string, currentUser: User) {
	const task = await getTaskById(id);

	if (task.claimedById !== currentUser.id && !canModifyTask(currentUser)) {
		throw error(403, 'You do not have permission to unclaim this task');
	}

	const [updatedTask] = await db.update(todoTask)
		.set({
			claimedById: null,
			updatedAt: new Date()
		})
		.where(eq(todoTask.id, id))
		.returning();

	return updatedTask;
}

// Get comments for a task
export async function getTaskComments(taskId: string) {
	return await db.query.todoComment.findMany({
		where: eq(todoComment.taskId, taskId),
		with: {
			user: true
		},
		orderBy: (comment) => comment.createdAt
	});
}

// Add a comment to a task
export async function addComment(taskId: string, content: string, currentUser: User) {
	await getTaskById(taskId); // Verify task exists

	const [comment] = await db.insert(todoComment).values({
		taskId,
		userId: currentUser.id,
		content
	}).returning();

	return comment;
} 