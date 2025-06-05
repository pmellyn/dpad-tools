import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import * as table from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	const categories = await db.select().from(table.gwCategory);
	const subcategories1 = await db.select().from(table.gwSubcategory1);
	const subcategories2 = await db.select().from(table.gwSubcategory2);
	const mappings = await db.select().from(table.gwCategoryMapping);

	return json({ categories, subcategories1, subcategories2, mappings });
};

export const POST: RequestHandler = async ({ request }) => {
	const { type, data } = await request.json();

	switch (type) {
		case 'category':
			await db.insert(table.gwCategory).values({ name: data.name });
			break;
		case 'subcategory1':
			await db.insert(table.gwSubcategory1).values({
				name: data.name,
				categoryId: data.categoryId
			});
			break;
		case 'subcategory2':
			await db.insert(table.gwSubcategory2).values({
				name: data.name,
				subcategoryId: data.subcategoryId
			});
			break;
		case 'mapping':
			await db.insert(table.gwCategoryMapping).values({
				excelValue: data.excelValue,
				mappingType: data.mappingType,
				mappedId: data.mappedId
			});
			break;
	}

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const { type, id } = await request.json();

	switch (type) {
		case 'category':
			await db.delete(table.gwCategory).where(eq(table.gwCategory.id, id));
			break;
		case 'subcategory1':
			await db.delete(table.gwSubcategory1).where(eq(table.gwSubcategory1.id, id));
			break;
		case 'subcategory2':
			await db.delete(table.gwSubcategory2).where(eq(table.gwSubcategory2.id, id));
			break;
		case 'mapping':
			await db.delete(table.gwCategoryMapping).where(eq(table.gwCategoryMapping.id, id));
			break;
	}

	return json({ success: true });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { type, id, data } = await request.json();

	switch (type) {
		case 'category':
			await db
				.update(table.gwCategory)
				.set({ name: data.name })
				.where(eq(table.gwCategory.id, id));
			break;
		case 'subcategory1':
			await db
				.update(table.gwSubcategory1)
				.set({ name: data.name, categoryId: data.categoryId })
				.where(eq(table.gwSubcategory1.id, id));
			break;
		case 'subcategory2':
			await db
				.update(table.gwSubcategory2)
				.set({ name: data.name, subcategoryId: data.subcategoryId })
				.where(eq(table.gwSubcategory2.id, id));
			break;
		case 'mapping':
			await db
				.update(table.gwCategoryMapping)
				.set({
					excelValue: data.excelValue,
					mappingType: data.mappingType,
					mappedId: data.mappedId
				})
				.where(eq(table.gwCategoryMapping.id, id));
			break;
	}

	return json({ success: true });
}; 