<script lang="ts">
    import { onMount } from "svelte";

    interface PostEntry {
        id: string;
        title: string;
        description: string;
        published: number;
        category: string | null;
        tags: string[];
        image: string | null;
        pinned: boolean;
    }

    let posts: PostEntry[] = [];
    let isLoading = true;
    let displayTitle = "";

    function getPostUrlBySlug(slug: string) {
        return `/posts/${slug}/`;
    }

    function formatDate(timestamp: number) {
        const date = new Date(timestamp);
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    async function init() {
        try {
            const response = await fetch("/api/allPostMeta.json");
            const allPosts = await response.json();
            
            const params = new URLSearchParams(window.location.search);
            const categoryName = params.get("category");
            const tagName = params.get("tag");
            const uncategorized = params.has("uncategorized");

            let filteredPosts = allPosts;

            if (uncategorized) {
                filteredPosts = allPosts.filter(p => !p.category || p.category.trim() === "");
                displayTitle = "未分类";
            } else if (categoryName) {
                const decodedCat = decodeURIComponent(categoryName);
                filteredPosts = allPosts.filter(p => p.category === decodedCat);
                displayTitle = decodedCat;
            } else if (tagName) {
                const decodedTag = decodeURIComponent(tagName);
                filteredPosts = allPosts.filter(p => p.tags && p.tags.includes(decodedTag));
                displayTitle = `#${decodedTag}`;
            }

            if (categoryName && tagName) {
                displayTitle = `${decodeURIComponent(categoryName)} · #${decodeURIComponent(tagName)}`;
            }

            filteredPosts.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return b.published - a.published;
            });

            posts = filteredPosts;
            isLoading = false;
        } catch (error) {
            console.error("Error loading posts:", error);
            isLoading = false;
        }
    }

    onMount(() => {
        init();
    });
</script>

{#if isLoading}
    <div class="card-base px-8 py-12 text-center w-full">
        <div class="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-30">加载中...</p>
    </div>
{:else}
    <!-- 分类标题 -->
    {#if displayTitle}
        <div class="card-base px-8 py-6 mb-6">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" x2="8" y1="13" y2="13"/>
                        <line x1="16" x2="8" y1="17" y2="17"/>
                        <line x1="10" x2="8" y1="9" y2="9"/>
                    </svg>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-90">{displayTitle}</h1>
                    <p class="text-sm text-30 mt-1">
                        {posts.length} 篇文章
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <!-- 文章列表 -->
    <div class="space-y-4">
        {#if posts.length > 0}
            {#each posts as entry}
                <article class="card-base p-4">
                    <a href={getPostUrlBySlug(entry.id)} class="flex gap-4 group">
                        {#if entry.image}
                            <div class="w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                <img 
                                    src={entry.image.trim()} 
                                    alt={entry.title}
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        {/if}
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                {#if entry.pinned}
                                    <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">置顶</span>
                                {/if}
                                {#if entry.category}
                                    <a href={`/archive/?category=${encodeURIComponent(entry.category)}`} class="text-xs text-[var(--primary)] hover:underline">
                                        {entry.category}
                                    </a>
                                {/if}
                            </div>
                            <h3 class="font-semibold text-90 group-hover:text-[var(--primary)] transition-colors truncate text-lg">
                                {entry.title}
                            </h3>
                            <p class="text-sm text-40 mt-1 line-clamp-2">
                                {entry.description}
                            </p>
                            <div class="flex items-center gap-2 mt-2 flex-wrap">
                                {#each entry.tags.slice(0, 3) as tag}
                                    <span class="text-xs text-30">#{tag}</span>
                                {/each}
                                <span class="text-xs text-30 ml-auto">
                                    {formatDate(entry.published)}
                                </span>
                            </div>
                        </div>
                    </a>
                </article>
            {/each}
        {:else}
            <div class="card-base px-8 py-12 text-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-30 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" x2="8" y1="13" y2="13"/>
                    <line x1="16" x2="8" y1="17" y2="17"/>
                    <line x1="10" x2="8" y1="9" y2="9"/>
                </svg>
                <p class="text-30">暂无数据</p>
            </div>
        {/if}
    </div>
{/if}