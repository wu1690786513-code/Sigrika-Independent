import { getSortedPosts } from "@/utils/content-utils";

export async function GET() {
	const posts = await getSortedPosts();

	const allPostsData = posts
		.map((post) => ({
			id: post.id,
			title: post.data.title,
			description: post.data.description,
			published: post.data.published.getTime(),
			updated: post.data.updated?.getTime() || null,
			category: post.data.category || null,
			tags: post.data.tags || [],
			image: post.data.image || null,
			draft: post.data.draft || false,
			pinned: post.data.pinned || false,
			password: !!post.data.password,
		}))
		.sort((a, b) => b.published - a.published);

	return new Response(JSON.stringify(allPostsData));
}
