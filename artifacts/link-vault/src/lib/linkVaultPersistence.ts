import type { Category, Link, LinkVaultData } from '../store/useLinkVault';
import { supabase } from './supabase';

function assertSupabase() {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
  return supabase;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return String(error);
}

function throwOnError(error: unknown) {
  if (error) {
    throw new Error(getErrorMessage(error));
  }
}

function mapLink(row: Record<string, unknown>): Link {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    url: String(row.url ?? ''),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    imagePosition: {
      x: Number(row.image_position_x ?? 50),
      y: Number(row.image_position_y ?? 50),
    },
    imageOpacity: Number(row.image_opacity ?? 100),
    titleColor: row.title_color ? String(row.title_color) : undefined,
    descriptionColor: row.description_color ? String(row.description_color) : undefined,
    titleFontSize: row.title_font_size == null ? undefined : Number(row.title_font_size),
    descriptionFontSize: row.description_font_size == null ? undefined : Number(row.description_font_size),
    titleFontFamily: row.title_font_family ? String(row.title_font_family) : undefined,
    descriptionFontFamily: row.description_font_family ? String(row.description_font_family) : undefined,
    titleBold: row.title_bold == null ? undefined : Boolean(row.title_bold),
    titleItalic: row.title_italic == null ? undefined : Boolean(row.title_italic),
    titleUnderline: row.title_underline == null ? undefined : Boolean(row.title_underline),
    descriptionBold: row.description_bold == null ? undefined : Boolean(row.description_bold),
    descriptionItalic: row.description_italic == null ? undefined : Boolean(row.description_italic),
    descriptionUnderline: row.description_underline == null ? undefined : Boolean(row.description_underline),
    color: row.color ? String(row.color) : undefined,
    order: Number(row.sort_order ?? 0),
  };
}

export async function loadVaultFromSupabase(): Promise<LinkVaultData> {
  const client = assertSupabase();
  const [categoriesResult, linksResult] = await Promise.all([
    client
      .from('categories')
      .select('id,name,icon,sort_order')
      .order('sort_order', { ascending: true }),
    client
      .from('links')
      .select('id,category_id,title,description,url,image_url,image_position_x,image_position_y,image_opacity,title_color,description_color,title_font_size,description_font_size,title_font_family,description_font_family,title_bold,title_italic,title_underline,description_bold,description_italic,description_underline,color,sort_order')
      .order('sort_order', { ascending: true }),
  ]);

  throwOnError(categoriesResult.error);
  throwOnError(linksResult.error);

  const linksByCategory = new Map<string, Link[]>();
  for (const row of (linksResult.data ?? []) as Record<string, unknown>[]) {
    const categoryId = String(row.category_id);
    const links = linksByCategory.get(categoryId) ?? [];
    links.push(mapLink(row));
    linksByCategory.set(categoryId, links);
  }

  const categories = ((categoriesResult.data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ''),
    icon: String(row.icon ?? 'Folder'),
    links: linksByCategory.get(String(row.id)) ?? [],
  }));

  return {
    categories,
    activeCategory: categories[0]?.id ?? '',
  };
}

function categoryRow(category: Category, index: number) {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    sort_order: index,
  };
}

function linkRow(categoryId: string, link: Link, index: number) {
  return {
    id: link.id,
    category_id: categoryId,
    title: link.title,
    description: link.description,
    url: link.url,
    image_url: link.imageUrl ?? null,
    image_position_x: link.imagePosition?.x ?? 50,
    image_position_y: link.imagePosition?.y ?? 50,
    image_opacity: link.imageOpacity ?? 100,
    title_color: link.titleColor ?? null,
    description_color: link.descriptionColor ?? null,
    title_font_size: link.titleFontSize ?? null,
    description_font_size: link.descriptionFontSize ?? null,
    title_font_family: link.titleFontFamily ?? null,
    description_font_family: link.descriptionFontFamily ?? null,
    title_bold: link.titleBold ?? null,
    title_italic: link.titleItalic ?? null,
    title_underline: link.titleUnderline ?? null,
    description_bold: link.descriptionBold ?? null,
    description_italic: link.descriptionItalic ?? null,
    description_underline: link.descriptionUnderline ?? null,
    color: link.color ?? null,
    sort_order: index,
  };
}

async function deleteMissingRows(
  table: 'categories' | 'links',
  currentIds: string[],
  nextIds: Set<string>,
) {
  if (currentIds.length === 0) return;
  const idsToDelete = currentIds.filter((id) => !nextIds.has(id));
  if (idsToDelete.length === 0) return;

  const { error } = await assertSupabase()
    .from(table)
    .delete()
    .in('id', idsToDelete);
  throwOnError(error);
}

export async function syncVaultToSupabase(data: LinkVaultData) {
  const client = assertSupabase();
  const categories = data.categories.map(categoryRow);
  const links = data.categories.flatMap((category) =>
    category.links.map((link, index) => linkRow(category.id, link, index)),
  );

  const existingCategoriesResult = await client.from('categories').select('id');
  throwOnError(existingCategoriesResult.error);
  const existingLinksResult = await client.from('links').select('id');
  throwOnError(existingLinksResult.error);

  await deleteMissingRows(
    'categories',
    ((existingCategoriesResult.data ?? []) as { id: string }[]).map((row) => row.id),
    new Set(categories.map((category) => category.id)),
  );
  await deleteMissingRows(
    'links',
    ((existingLinksResult.data ?? []) as { id: string }[]).map((row) => row.id),
    new Set(links.map((link) => link.id)),
  );

  if (categories.length > 0) {
    const { error } = await client
      .from('categories')
      .upsert(categories, { onConflict: 'id' });
    throwOnError(error);
  }

  if (links.length > 0) {
    const { error } = await client
      .from('links')
      .upsert(links, { onConflict: 'id' });
    throwOnError(error);
  }
}