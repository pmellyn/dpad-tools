import { pgTable, text, timestamp, pgEnum, jsonb, integer, decimal, uuid } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['Associate', 'Manager', 'Administrator']);

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	firstName: text('firstname').notNull(),
	lastName: text('lastname').notNull(),
	passwordHash: text('password').notNull(),
	role: userRoleEnum('role').notNull().default('Associate')
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const tcgTrade = pgTable('tcg_trade', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	products: jsonb('products').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const tcgPricing = pgTable('tcg_pricing', {
	id: text('id').primaryKey(),
	priceRange: text('price_range').notNull(),
	margin: integer('margin').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Games Workshop Schema
export const gwCategory = pgTable('gw_category', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const gwSubcategory1 = pgTable('gw_subcategory1', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	categoryId: uuid('category_id')
		.notNull()
		.references(() => gwCategory.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const gwSubcategory2 = pgTable('gw_subcategory2', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	subcategoryId: uuid('subcategory_id')
		.notNull()
		.references(() => gwSubcategory1.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const gwProduct = pgTable('gw_product', {
	id: uuid('id').primaryKey().defaultRandom(),
	productName: text('product_name').notNull(),
	description: text('description'),
	sku: text('sku').notNull().unique(),
	barcode: text('barcode').unique(),
	module: text('module'),
	packQuantity: integer('pack_quantity').notNull().default(1),
	price: decimal('price', { precision: 10, scale: 2 }).notNull(),
	cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
	image: text('image'),
	link: text('link'),
	categoryId: uuid('category_id')
		.notNull()
		.references(() => gwCategory.id),
	subcategoryId: uuid('subcategory_id')
		.references(() => gwSubcategory1.id),
	subcategory2Id: uuid('subcategory2_id')
		.references(() => gwSubcategory2.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const gwCategoryMapping = pgTable('gw_category_mapping', {
	id: uuid('id').primaryKey().defaultRandom(),
	excelValue: text('excel_value').notNull(),
	mappingType: text('mapping_type', { enum: ['category', 'subcategory1', 'subcategory2'] }).notNull(),
	mappedId: uuid('mapped_id').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type TCGTrade = typeof tcgTrade.$inferSelect;
export type TCGPricing = typeof tcgPricing.$inferSelect;
export type GWCategory = typeof gwCategory.$inferSelect;
export type GWSubcategory1 = typeof gwSubcategory1.$inferSelect;
export type GWSubcategory2 = typeof gwSubcategory2.$inferSelect;
export type GWProduct = typeof gwProduct.$inferSelect;
