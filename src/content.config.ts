import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    categorySlug: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    oldUrl: z.string().url().optional(),
    featuredImage: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    author: z.string().default("فريق طموح")
  })
});

const articlesEn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles-en" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().default("Education"),
    categorySlug: z.string().default("education"),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    originalUrl: z.string().optional(),
    author: z.string().default("Fortelese Editorial")
  })
});

export const collections = { articles, articlesEn };