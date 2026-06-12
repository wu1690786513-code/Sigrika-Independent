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

    interface TagInfo {
        name: string;
        count: number;
    }

    let posts: PostEntry[] = [];
    let tags: TagInfo[] = [];
    let isLoading = true;
    let displayTitle = "";
    let currentLayout = "list";
    
    const defaultLayout = "list";
    const mobileDefaultLayout = "grid";
    const masonryEnabled = false;
    const columnWidth = 280;

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

    function updateLayout(newLayout: string) {
        const container = document.getElementById('post-list-container');
        if (!container) return;

        const isCurrentGrid = container.classList.contains("grid-mode");
        const isCurrentList = container.classList.contains("list-mode");
        const current = isCurrentGrid ? "grid" : (isCurrentList ? "list" : null);

        if (current === newLayout) return;

        container.classList.add("layout-switching");

        setTimeout(() => {
            container.classList.remove("list-mode", "grid-mode", "post-grid-auto", "flex", "flex-col", "gap-4", "md:gap-4");
            
            if (newLayout === "grid") {
                container.classList.add("grid-mode", "post-grid-auto");
            } else {
                container.classList.add("list-mode", "flex", "flex-col", "gap-4", "md:gap-4");
            }

            requestAnimationFrame(() => {
                container.classList.remove("layout-switching");
            });
        }, 200);

        localStorage.setItem('postListLayout', newLayout);
        currentLayout = newLayout;
    }

    function initLayout() {
        const container = document.getElementById('post-list-container');
        if (!container) return;

        const savedLayout = localStorage.getItem('postListLayout');
        const effectiveDefault = window.innerWidth < 780 ? mobileDefaultLayout : defaultLayout;
        let layout = window.innerWidth < 380 ? 'grid' : (savedLayout || effectiveDefault);

        container.classList.remove("list-mode", "grid-mode", "post-grid-auto", "flex", "flex-col", "gap-4", "md:gap-4");
        
        if (layout === "grid") {
            container.classList.add("grid-mode", "post-grid-auto");
        } else {
            container.classList.add("list-mode", "flex", "flex-col", "gap-4", "md:gap-4");
        }

        currentLayout = layout;
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
            <div class="flex items-center justify-between">
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
                
                <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        on:click={() => updateLayout("list")}
                        class={`p-2 rounded-md transition-all ${currentLayout === "list" ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                        title="列表视图"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="8" x2="21" y1="6" y2="6"/>
                            <line x1="8" x2="21" y1="12" y2="12"/>
                            <line x1="8" x2="21" y1="18" y2="18"/>
                            <line x1="3" x2="3.01" y1="6" y2="6"/>
                            <line x1="3" x2="3.01" y1="12" y2="12"/>
                            <line x1="3" x2="3.01" y1="18" y2="18"/>
                        </svg>
                    </button>
                    <button
                        on:click={() => updateLayout("grid")}
                        class={`p-2 rounded-md transition-all ${currentLayout === "grid" ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                        title="网格视图"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                    </button>
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

    <div
        id="post-list-container"
        class="transition-all duration-500 ease-in-out mb-4"
        data-default-layout={defaultLayout}
        data-mobile-default-layout={mobileDefaultLayout}
        data-masonry-enabled={masonryEnabled}
        data-column-width={columnWidth}
        style={`--post-card-min-width: ${columnWidth}px;`}
    >
        {#if posts.length > 0}
            {#each posts as entry}
                <article class="post-card-wrapper card-base overflow-hidden relative flex flex-col-reverse w-full rounded-[var(--radius-large)] {entry.image ? 'has-cover' : 'no-cover'} {entry.pinned ? 'pinned' : ''}">
                    <div class="post-card-content pl-4 md:pl-9 pr-4 md:pr-2 pt-4 md:pt-7 pb-4 md:pb-7 relative flex flex-col h-full w-full">
                        <a href={getPostUrlBySlug(entry.id)} class="post-card-title transition group w-full block font-bold mb-3 text-3xl text-90 hover:text-[var(--primary)] before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)] before:absolute before:top-[35px] before:left-[18px] before:hidden md:before:block">
                            {entry.title}
                        </a>
                        
                        <div class="post-meta mb-4 flex items-center flex-wrap gap-2 text-sm text-40">
                            {#if entry.pinned}
                                <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">置顶</span>
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
                        
                        <div class="text-75 md:pr-4 grow description" title={entry.description}>
                            {entry.description}
                        </div>
                        
                        <div class="text-sm text-black/30 dark:text-white/30 flex flex-wrap gap-2 pt-3 stats">
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
                            class="post-card-image group w-full aspect-2/1 relative rounded-[var(--radius-large)] overflow-hidden"
                        >
                            <div class="absolute pointer-events-none z-10 w-full h-full group-hover:bg-black/30 group-active:bg-black/50 transition"></div>
                            <div class="absolute pointer-events-none z-20 w-full h-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="transition opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 text-white w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m9 18 6-6-6-6"/>
                                </svg>
                            </div>
                            <img 
                                src={entry.image.trim()} 
                                alt={entry.title}
                                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                            />
                        </a>
                    {:else}
                        <a
                            href={getPostUrlBySlug(entry.id)}
                            class="post-card-enter-btn flex btn-regular w-13 absolute right-3 top-3 bottom-3 rounded-xl bg-[var(--enter-btn-bg)] hover:bg-[var(--enter-btn-bg-hover)] active:bg-[var(--enter-btn-bg-active)] active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="transition text-[var(--primary)] w-10 h-10 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </a>
                    {/if}
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

<style>
    .post-grid-auto {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--post-card-min-width, 320px), 1fr));
        gap: 1rem;
    }

    #post-list-container {
        transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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

    @media (max-width: 767px) {
        .list-mode .post-card-wrapper {
            flex-direction: row !important;
        }

        .list-mode .has-cover .post-card-content {
            width: calc(100% - 9rem - 0.75rem) !important;
            padding: 0.75rem 0.5rem 0.75rem 0.75rem !important;
        }

        .list-mode .has-cover .post-card-image {
            position: absolute !important;
            top: 0.5rem !important;
            bottom: 0.5rem !important;
            right: 0.5rem !important;
            width: 9rem !important;
            aspect-ratio: auto !important;
            border-radius: 0.75rem !important;
        }

        .list-mode .post-card-title {
            font-size: 1.125rem !important;
            line-height: 1.75rem !important;
            margin-bottom: 0.5rem !important;
        }

        .list-mode .post-card-title::before {
            display: none !important;
        }

        .list-mode .stats a {
            font-size: 0.65rem !important;
            padding: 0.125rem 0.375rem !important;
            height: 1.25rem !important;
        }

        .list-mode .no-cover .post-card-content {
            width: calc(100% - 52px - 12px) !important;
        }

        .grid-mode .post-card-wrapper {
            flex-direction: column-reverse !important;
            height: 100% !important;
            justify-content: flex-end !important;
        }

        .grid-mode .post-card-content {
            width: 100% !important;
            height: auto !important;
            flex-grow: 1 !important;
        }

        .grid-mode .post-card-image {
            position: relative !important;
            top: auto !important;
            bottom: auto !important;
            right: auto !important;
            width: 100% !important;
            margin: 0 !important;
            border-radius: var(--radius-large) var(--radius-large) 0 0 !important;
            max-height: none !important;
            aspect-ratio: 2/1 !important;
        }
    }

    @media (min-width: 768px) {
        .list-mode .post-card-wrapper {
            flex-direction: row !important;
        }

        .list-mode .has-cover .post-card-content {
            width: calc(100% - 30% - 1.5rem) !important;
            padding: 1.75rem 0.5rem 1.75rem 2.25rem !important;
        }

        .list-mode .has-cover .post-card-image {
            position: absolute !important;
            top: 1rem !important;
            bottom: 1rem !important;
            right: 1rem !important;
            width: 30% !important;
            border-radius: 0.75rem !important;
            aspect-ratio: auto !important;
        }

        .list-mode .post-card-title {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
            margin-bottom: 0.75rem !important;
        }

        .list-mode .post-card-title::before {
            display: block !important;
            top: 2.25rem !important;
            height: 1rem !important;
        }

        .list-mode .stats a {
            font-size: 0.75rem !important;
            padding: 0.25rem 0.5rem !important;
            height: 1.5rem !important;
        }

        .list-mode .no-cover .post-card-content {
            width: calc(100% - 52px - 12px) !important;
        }

        .grid-mode .post-card-wrapper {
            flex-direction: column-reverse !important;
            height: 100% !important;
            justify-content: flex-end !important;
        }

        .grid-mode .post-card-content {
            width: 100% !important;
            padding: 1rem !important;
        }

        .grid-mode .post-card-image {
            width: 100% !important;
            position: relative !important;
            top: auto !important;
            right: auto !important;
            bottom: auto !important;
            border-radius: var(--radius-large) var(--radius-large) 0 0 !important;
        }

        .grid-mode .no-cover .post-card-content {
            padding-right: 4.5rem !important;
        }

        .grid-mode .post-card-title {
            font-size: 1.35rem !important;
            line-height: 1.75rem !important;
            margin-bottom: 0.5rem !important;
        }

        .grid-mode .post-card-title::before {
            display: none !important;
        }

        .grid-mode .post-meta {
            margin-bottom: 0.5rem !important;
            gap: 0.5rem !important;
        }
    }
</style>