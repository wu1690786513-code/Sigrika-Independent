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
        password?: boolean;
        updated?: number;
    }

    interface TagInfo {
        name: string;
        count: number;
    }

    let posts: PostEntry[] = [];
    let tags: TagInfo[] = [];
    let isLoading = true;
    let displayTitle = "";

    const masonryEnabled = false;
    const columnWidth = 280;
    const defaultLayout = "list";
    const mobileDefaultLayout = "grid";
    const initialLayoutClass = defaultLayout === "grid" 
        ? "post-grid-auto grid-mode" 
        : "flex flex-col gap-4 md:gap-4 list-mode";

    function getPostUrlBySlug(slug: string) {
        return `/posts/${slug}/`;
    }

    function getTagUrl(tag: string) {
        return `/archive/?tag=${encodeURIComponent(tag)}`;
    }

    function formatDate(timestamp: number) {
        const date = new Date(timestamp);
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function initLayout() {
        const postListContainer = document.getElementById("post-list-container");
        if (!postListContainer) return;

        const savedLayout = localStorage.getItem("postListLayout");
        const effectiveDefault = window.innerWidth < 780 ? mobileDefaultLayout : defaultLayout;
        let currentLayout = savedLayout || effectiveDefault;

        if (window.innerWidth < 380) {
            currentLayout = "grid";
        }

        updatePostListLayout(currentLayout);
    }

    function updatePostListLayout(layout: string) {
        const postListContainer = document.getElementById("post-list-container");
        if (!postListContainer) return;

        const isCurrentGrid = postListContainer.classList.contains("grid-mode");
        const isCurrentList = postListContainer.classList.contains("list-mode");
        const currentLayout = isCurrentGrid ? "grid" : (isCurrentList ? "list" : null);

        const applyClasses = () => {
            postListContainer.classList.remove("list-mode", "grid-mode", "post-grid-auto");
            if (layout === "grid") {
                postListContainer.classList.add("grid-mode");
                postListContainer.classList.remove("flex", "flex-col");
                if (masonryEnabled) {
                    postListContainer.classList.remove("post-grid-auto");
                } else {
                    postListContainer.classList.add("post-grid-auto");
                }
            } else {
                postListContainer.classList.add("list-mode");
                postListContainer.classList.add("flex", "flex-col", "gap-4", "md:gap-4");
                postListContainer.classList.remove("post-grid-auto");
            }
        };

        if (!currentLayout) {
            applyClasses();
            return;
        }

        if (currentLayout === layout) {
            return;
        }

        postListContainer.classList.add("layout-switching");

        setTimeout(() => {
            applyClasses();

            requestAnimationFrame(() => {
                postListContainer.classList.remove("layout-switching");
            });
        }, 200);
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
                filteredPosts = allPosts.filter((p: PostEntry) => !p.category || p.category.trim() === "");
                displayTitle = "未分类";
            } else if (categoryName) {
                const decodedCat = decodeURIComponent(categoryName);
                filteredPosts = allPosts.filter((p: PostEntry) => p.category === decodedCat);
                displayTitle = decodedCat;
            } else if (tagName) {
                const decodedTag = decodeURIComponent(tagName);
                filteredPosts = allPosts.filter((p: PostEntry) => p.tags && p.tags.includes(decodedTag));
                displayTitle = `#${decodedTag}`;
            }

            if (categoryName && tagName) {
                displayTitle = `${decodeURIComponent(categoryName)} · #${decodeURIComponent(tagName)}`;
            }

            filteredPosts.sort((a: PostEntry, b: PostEntry) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return b.published - a.published;
            });

            const tagCountMap: Record<string, number> = {};
            filteredPosts.forEach((post: PostEntry) => {
                (post.tags || []).forEach((tag: string) => {
                    tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
                });
            });
            tags = Object.entries(tagCountMap)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => ({ name, count }));

            posts = filteredPosts;
            isLoading = false;
            
            setTimeout(initLayout, 50);
        } catch (error) {
            console.error("Error loading posts:", error);
            isLoading = false;
        }
    }

    onMount(() => {
        init();

        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(initLayout, 250);
        });

        window.addEventListener("layoutChange", (event: any) => {
            const newLayout = event.detail.layout;
            updatePostListLayout(newLayout);
        });

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                setTimeout(initLayout, 100);
            }
        });
    });
</script>

{#if isLoading}
    <div class="card-base px-8 py-12 text-center w-full">
        <div class="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-30">加载中...</p>
    </div>
{:else}
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

    {#if tags.length > 0}
        <div class="card-base px-6 py-5 mb-6">
            <div class="flex items-center gap-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                    <path d="M7 7h.01"/>
                </svg>
                <span class="text-sm font-medium text-90">标签</span>
                <span class="text-xs text-30">({tags.length})</span>
            </div>
            <div class="flex flex-wrap gap-2">
                {#each tags as tag}
                    <a
                        href={getTagUrl(tag.name)}
                        class="btn-regular px-3 py-1.5 text-sm rounded-md
                               transition-all duration-200
                               hover:scale-105 hover:bg-[var(--primary)]/20
                               active:scale-95"
                    >
                        #{tag.name}
                        <span class="ml-1 text-xs opacity-60">({tag.count})</span>
                    </a>
                {/each}
            </div>
        </div>
    {/if}

    <!-- 文章列表 - 完全按照 1.txt 的结构 -->
    <div
        id="post-list-container"
        class={`transition-all duration-500 ease-in-out mb-4 ${initialLayoutClass}`}
        data-default-layout={defaultLayout}
        data-mobile-default-layout={mobileDefaultLayout}
        data-masonry-enabled={masonryEnabled}
        data-column-width={columnWidth}
        style={`--post-card-min-width: ${columnWidth}px;`}
    >
        {#if posts.length > 0}
            {#each posts as entry, index}
                <!-- 使用与 PostCard.astro 完全相同的结构 -->
                <div
                    class="post-card-wrapper
                           {entry.image ? 'has-cover' : 'no-cover'}
                           {entry.pinned ? 'pinned' : ''}
                           card-base flex flex-col-reverse w-full rounded-[var(--radius-large)] overflow-hidden relative post-card-item"
                    style={`animation-delay: calc(var(--content-delay) + ${index * 50}ms);`}
                >
                    <div
                        class="post-card-content
                               pl-4 md:pl-9 pr-4 md:pr-2 pt-4 md:pt-7 pb-4 md:pb-7 relative flex flex-col h-full
                               ${entry.image ? '' : 'w-full md:w-[calc(100%-52px-12px)]'}"
                    >
                        <a
                            href={getPostUrlBySlug(entry.id)}
                            class="post-card-title transition group w-full block font-bold mb-3 text-3xl text-90
                                hover:text-[var(--primary)]
                                before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
                                before:absolute before:top-[35px] before:left-[18px] before:hidden md:before:block"
                        >
                            {entry.title}
                            {#if entry.password}
                                <svg xmlns="http://www.w3.org/2000/svg" class="inline text-2xl align-middle -translate-y-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            {/if}
                        </a>

                        <!-- PostMetadata 替代 -->
                        <div class="post-meta mb-4 flex items-center flex-wrap gap-2 text-sm text-40">
                            {#if entry.pinned}
                                <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded pinned-btn">置顶</span>
                            {/if}
                            {#if entry.category}
                                <a href={`/archive/?category=${encodeURIComponent(entry.category)}`} class="text-xs text-[var(--primary)] hover:underline">
                                    {entry.category}
                                </a>
                            {/if}
                            <span class="text-xs text-30">
                                {formatDate(entry.published)}
                            </span>
                        </div>

                        <!-- description -->
                        <div class="transition text-75 md:pr-4 description grow" title={entry.description}>
                            {entry.description}
                        </div>

                        <!-- tags -->
                        <div class="text-sm text-black/30 dark:text-white/30 flex flex-wrap gap-2 transition stats pt-3">
                            {#if entry.tags && entry.tags.length > 0}
                                {#each entry.tags.slice(0, 4) as tag}
                                    <a
                                        href={getTagUrl(tag)}
                                        class="btn-regular h-6 text-xs px-2 py-1 rounded-md
                                               transition-all duration-200 hover:scale-105 active:scale-95"
                                    >
                                        #{tag.trim()}
                                    </a>
                                {/each}
                            {:else}
                                <span class="text-xs text-30">无标签</span>
                            {/if}
                        </div>
                    </div>

                    {#if entry.image}
                        <a
                            href={getPostUrlBySlug(entry.id)}
                            class="post-card-image group w-full md:w-[30%] aspect-2/1 md:aspect-auto
                                   relative md:absolute md:top-4 md:bottom-4 md:right-4
                                   rounded-[var(--radius-large)] md:rounded-xl overflow-hidden"
                        >
                            <div class="absolute pointer-events-none z-10 w-full h-full group-hover:bg-black/30 group-active:bg-black/50 transition" />
                            <div class="absolute pointer-events-none z-20 w-full h-full flex items-center justify-center ">
                                <svg xmlns="http://www.w3.org/2000/svg" class="transition opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 text-white text-5xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m9 18 6-6-6-6"/>
                                </svg>
                            </div>
                            <img 
                                src={entry.image.trim()} 
                                alt={entry.title}
                                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-active:scale-115"
                                loading="lazy"
                            />
                        </a>
                    {:else}
                        <a
                            href={getPostUrlBySlug(entry.id)}
                            class="post-card-enter-btn flex btn-regular w-13
                                   absolute right-3 top-3 bottom-3 rounded-xl bg-[var(--enter-btn-bg)]
                                   hover:bg-[var(--enter-btn-bg-hover)] active:bg-[var(--enter-btn-bg-active)] active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="transition text-[var(--primary)] text-4xl mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </a>
                    {/if}
                </div>
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

<style>
    :global(.post-grid-auto) {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--post-card-min-width, 320px), 1fr));
        gap: 1rem;
    }

    @media (max-width: 767px) {
        :global(.list-mode :global(.post-meta)) {
            margin-bottom: 0.25rem !important;
            gap: 0.25rem !important;
        }
    }

    #post-list-container {
        transition: opacity 0.2s ease-out, transform 0.2s ease-out;
    }

    #post-list-container.layout-switching {
        opacity: 0;
        transform: translateY(10px);
    }

    .description {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        -webkit-line-clamp: 2;
        line-clamp: 2;
    }

    #post-list-container.grid-mode :global(.post-card-wrapper) {
        flex-direction: column-reverse !important;
    }

    #post-list-container.grid-mode :global(.post-card-image) {
        width: 100% !important;
        position: relative !important;
        top: auto !important;
        right: auto !important;
        bottom: auto !important;
        border-radius: var(--radius-large) var(--radius-large) 0 0 !important;
    }

    #post-list-container.grid-mode :global(.post-card-content) {
        width: 100% !important;
        padding: 1rem !important;
    }

    #post-list-container.grid-mode :global(.no-cover .post-card-content) {
        padding-right: 4.5rem !important;
    }

    #post-list-container.grid-mode :global(.post-card-title) {
        font-size: 1.35rem !important;
        line-height: 1.75rem !important;
        margin-bottom: 0.5rem !important;
    }

    #post-list-container.grid-mode :global(.post-card-title::before) {
        display: none !important;
    }

    #post-list-container.grid-mode :global(.post-meta) {
        margin-bottom: 0.5rem !important;
        gap: 0.5rem !important;
    }

    #post-list-container.grid-mode :global(.post-meta .pinned-btn) {
        padding: 0.25rem 0.375rem !important;
    }
</style>