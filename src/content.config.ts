import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const postsCollection = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: [
      // 只匹配 md/mdx 文章
      "**/*.{md,mdx}",
      // 排除所有指定目录下的全部内容
      "!**/{Template,00_其他,00_Attachments,.obsidian}/**",
    ],
  }),
  schema: z.object({
    title: z.string(),
    // coerce 自动把字符串日期转 Date，同步远程文章必备
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().optional().default(false),
    description: z.string().optional().default(""),
    image: z.string().optional().default(""),
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional().default(""),
    lang: z.string().optional().default(""),
    pinned: z.boolean().optional().default(false),
    author: z.string().optional().default(""),
    sourceLink: z.string().optional().default(""),
    licenseName: z.string().optional().default(""),
    licenseUrl: z.string().optional().default(""),
    comment: z.boolean().optional().default(true),
    password: z.string().optional().default(""),
    passwordHint: z.string().optional().default(""),

    /* 内部导航字段 */
    prevTitle: z.string().default(""),
    prevSlug: z.string().default(""),
    nextTitle: z.string().default(""),
    nextSlug: z.string().default(""),
  }),
});

const specCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/spec" }),
  schema: z.object({}),
});

export const collections = {
  posts: postsCollection,
  spec: specCollection,
};