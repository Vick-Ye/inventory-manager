export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

export async function generateUniqueSlug(
  name: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = slugify(name)
  if (!slug) slug = 'item'

  let counter = 1
  while (await checkExists(slug)) {
    counter++
    slug = `${slugify(name)}-${counter}`
  }

  return slug
}
