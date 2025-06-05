import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { gwCategoryMapping } from '$lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

type GWCategoryMapping = InferSelectModel<typeof gwCategoryMapping>;

export const GET: RequestHandler = async () => {
	try {
		const mappings = await db.query.gwCategoryMapping.findMany();
		
		// Get all categories, subcategories1, and subcategories2 for name lookup
		const categories = await db.query.gwCategory.findMany();
		const subcategories1 = await db.query.gwSubcategory1.findMany();
		const subcategories2 = await db.query.gwSubcategory2.findMany();
		
		// Convert the mappings to the format expected by the frontend
		const formattedMappings = mappings.reduce((acc: Record<string, { type: 'category' | 'subcategory1' | 'subcategory2', id: string, name: string }>, mapping: GWCategoryMapping) => {
			let name = '';
			
			// Find the name based on the mapping type
			switch (mapping.mappingType) {
				case 'category':
					name = categories.find(c => c.id === mapping.mappedId)?.name || '';
					break;
				case 'subcategory1':
					name = subcategories1.find(s => s.id === mapping.mappedId)?.name || '';
					break;
				case 'subcategory2':
					name = subcategories2.find(s => s.id === mapping.mappedId)?.name || '';
					break;
			}
			
			acc[mapping.excelValue] = {
				type: mapping.mappingType as 'category' | 'subcategory1' | 'subcategory2',
				id: mapping.mappedId,
				name: name
			};
			return acc;
		}, {});

		return json(formattedMappings);
	} catch (error) {
		console.error('Error fetching mappings:', error);
		return json({ error: 'Failed to fetch mappings' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { excelCategory, mapping } = await request.json();

		// Delete any existing mapping for this category
		await db.delete(gwCategoryMapping).where(eq(gwCategoryMapping.excelValue, excelCategory));

		// Create new mapping
		await db.insert(gwCategoryMapping).values({
			excelValue: excelCategory,
			mappingType: mapping.type,
			mappedId: mapping.id
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error saving mapping:', error);
		return json({ error: 'Failed to save mapping' }, { status: 500 });
	}
}; 