import {
  productCategories,
  type ChecklistTemplate,
  type Product,
  type ProductionLibrary,
  type ProductionTask,
  type ProductCategory,
} from './types';
export function legacyProductId(category: string) {
  return `product-${category.toLowerCase()}`;
}
export function defaultProductionLibrary(
  workspaceId: string,
): ProductionLibrary {
  return {
    categories: productCategories.map((name) => ({
      id: legacyCategoryId(name),
      workspaceId,
      name,
      description: '',
      active: true,
    })),
    products: productCategories.map((category) => ({
      id: legacyProductId(category),
      workspaceId,
      name: category,
      category,
      description: '',
      active: true,
    })),
    templates: [
      {
        id: 'template-custom-cake',
        workspaceId,
        name: 'Custom Cake Production',
        description: 'A reusable cake workflow.',
        category: 'Cakes',
        steps: [
          'Bake cake layers.',
          'Prepare filling.',
          'Fill and crumb coat.',
          'Final decoration.',
          'Box and label.',
          'Final inspection.',
        ],
        active: true,
      },
      {
        id: 'template-sugar-cookies',
        workspaceId,
        name: 'Decorated Sugar Cookies',
        description: 'From dough to packaged cookies.',
        category: 'Cookies',
        steps: [
          'Prepare dough.',
          'Cut and bake cookies.',
          'Prepare royal icing.',
          'Decorate cookies.',
          'Allow icing to dry.',
          'Package and label.',
        ],
        active: true,
      },
    ],
  };
}
export function taskProductName(task: ProductionTask, products: Product[]) {
  return (
    products.find(
      (product) =>
        product.id === (task.productId ?? legacyProductId(task.category)),
    )?.name ??
    task.productName ??
    task.category
  );
}
export function productTaskCount(productId: string, tasks: ProductionTask[]) {
  return tasks.filter(
    (task) => (task.productId ?? legacyProductId(task.category)) === productId,
  ).length;
}
export function validateProduct(
  product: Product,
  categories?: ProductCategory[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!product?.id || typeof product.id !== 'string')
    errors.id = 'Product ID is required.';
  if (
    typeof product?.name !== 'string' ||
    !product.name.trim() ||
    product.name.trim().length > 80
  )
    errors.name = 'Enter a product name (up to 80 characters).';
  if (
    !validCategoryName(product?.category) ||
    (categories && !recordCategory(product, categories))
  )
    errors.category = 'Choose a product category.';
  if (
    typeof product?.description !== 'string' ||
    product.description.length > 500
  )
    errors.description = 'Use up to 500 characters.';
  if (typeof product?.active !== 'boolean')
    errors.active = 'Choose an active status.';
  return errors;
}
export function validateTemplate(
  template: ChecklistTemplate,
  categories?: ProductCategory[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!template?.id || typeof template.id !== 'string')
    errors.id = 'Template ID is required.';
  if (
    typeof template?.name !== 'string' ||
    !template.name.trim() ||
    template.name.trim().length > 80
  )
    errors.name = 'Enter a template name (up to 80 characters).';
  if (
    typeof template?.description !== 'string' ||
    template.description.length > 500
  )
    errors.description = 'Use up to 500 characters.';
  if (
    template?.category &&
    (!validCategoryName(template.category) ||
      (categories && !recordCategory(template, categories)))
  )
    errors.category = 'Choose a product category.';
  if (
    !Array.isArray(template?.steps) ||
    !template.steps.length ||
    template.steps.length > 50 ||
    template.steps.some(
      (step) => typeof step !== 'string' || !step.trim() || step.length > 100,
    )
  )
    errors.steps = 'Add 1–50 nonempty steps, up to 100 characters each.';
  if (typeof template?.active !== 'boolean')
    errors.active = 'Choose an active status.';
  return errors;
}
export function copyTemplateSteps(template: ChecklistTemplate) {
  return template.steps.map((label) => ({ label, done: false }));
}

export function validCategoryName(value: unknown): value is string {
  return (
    typeof value === 'string' && !!value.trim() && value.trim().length <= 50
  );
}
export function legacyCategoryId(name: string) {
  const known = productCategories.find(
    (value) => value.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
  if (known) return `category-${known.toLowerCase()}`;
  let hash = 2166136261;
  for (const ch of name.trim().toLocaleLowerCase())
    hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  return `category-legacy-${(hash >>> 0).toString(16)}`;
}
export function recordCategory(
  record: { category?: string; categoryId?: string },
  categories: ProductCategory[],
) {
  return (
    categories.find(
      (item) =>
        item.id ===
        (record.categoryId ?? legacyCategoryId(record.category ?? '')),
    ) ??
    (!record.categoryId
      ? categories.find(
          (item) =>
            item.name.toLocaleLowerCase() ===
            record.category?.toLocaleLowerCase(),
        )
      : undefined)
  );
}
export function categoryName(
  record: { category?: string; categoryId?: string },
  categories: ProductCategory[],
) {
  return recordCategory(record, categories)?.name ?? record.category ?? '';
}
export function categoryFromValue(
  value: string,
  categories: ProductCategory[],
) {
  return value
    ? categories.find(
        (item) =>
          item.id === value ||
          item.name === value ||
          item.id === legacyCategoryId(value),
      )
    : undefined;
}
export function matchesTaskCategory(
  task: ProductionTask,
  value: string,
  categories: ProductCategory[],
) {
  if (!value) return true;
  const selected = categoryFromValue(value, categories);
  return selected
    ? recordCategory(task, categories)?.id === selected.id
    : task.categoryId === value || task.category === value;
}
export function isSelectableProduct(
  product: Product,
  categories: ProductCategory[],
) {
  return product.active && recordCategory(product, categories)?.active === true;
}
export function categoryProductCount(
  id: string,
  products: Product[],
  categories: ProductCategory[],
) {
  return products.filter(
    (product) => recordCategory(product, categories)?.id === id,
  ).length;
}
export function validateCategory(
  category: ProductCategory,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!category?.id || typeof category.id !== 'string')
    errors.id = 'Category ID is required.';
  if (!validCategoryName(category?.name))
    errors.name = 'Enter a category name (up to 50 characters).';
  if (
    typeof category?.description !== 'string' ||
    category.description.length > 500
  )
    errors.description = 'Use up to 500 characters.';
  if (typeof category?.active !== 'boolean')
    errors.active = 'Choose an active status.';
  return errors;
}
