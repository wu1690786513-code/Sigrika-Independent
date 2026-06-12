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

    const masonryEnabled = false;
    const columnWidth = 280;
    const defaultLayout = "list";
    const mobileDefaultLayout = "grid";
    const coverWidth = "30%";
    const descriptionClampLines = 2;
    const showTags = true;

    function getInitialLayoutClass() {
        const effectiveDefault = typeof window !== 'undefined' && window.innerWidth < 780 
            ? mobileDefaultLayout 
            : defaultLayout;
        const savedLayout = typeof window !== 'undefined' ? localStorage.getItem("postListLayout") : null;
        const effectiveLayout = savedLayout || effectiveDefault;
        
        if (typeof window !== 'undefined' && window.innerWidth < 380) {
            return "post-grid-auto grid-mode";
        }
        
        return effectiveLayout === "grid" 
            ? "post-grid-auto grid-mode" 
            : "flex flex-col gap-4 md:gap-4 list-mode";
    }

    let posts: PostEntry[] = [];
    let tags: TagInfo[] = [];
    let isLoading = true;
    let displayTitle = "";
    let currentLayoutClass = "flex flex-col gap-4 md:gap-4 list-mode";
    
    // 客户端初始化时更新布局类
    function updateLayoutClass() {
        if (typeof window === 'undefined') return;
        
        const savedLayout = localStorage.getItem("postListLayout");
        const effectiveDefault = window.innerWidth < 780 ? mobileDefaultLayout : defaultLayout;
        const effectiveLayout = window.innerWidth < 380 ? 'grid' : (savedLayout || effectiveDefault);
        
        currentLayoutClass = effectiveLayout === "grid" 
            ? "post-grid-auto grid-mode" 
            : "flex flex-col gap-4 md:gap-4 list-mode";
    }

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

        updatePostListLayout(currentLayout, true);
    }

    function updatePostListLayout(layout: string, force = false) {
        const postListContainer = document.getElementById("post-list-container");
        if (!postListContainer) return;

        const isCurrentGrid = postListContainer.classList.contains("grid-mode");
        const isCurrentList = postListContainer.classList.contains("list-mode");
        const currentLayout = isCurrentGrid ? "grid" : (isCurrentList ? "list" : null);

        const applyClasses = () => {
            postListContainer.classList.remove("list-mode", "grid-mode", "post-grid-auto", "flex", "flex-col", "gap-4", "md:gap-4");
            if (layout === "grid") {
                postListContainer.classList.add("grid-mode");
                if (!masonryEnabled) {
                    postListContainer.classList.add("post-grid-auto");
                }
            } else {
                postListContainer.classList.add("list-mode", "flex", "flex-col", "gap-4", "md:gap-4");
            }
            // 同步更新响应式变量
            currentLayoutClass = layout === "grid" 
                ? "post-grid-auto grid-mode" 
                : "flex flex-col gap-4 md:gap-4 list-mode";
        };

        if (!currentLayout || force) {
            applyClasses();
            return;
        }

        if (currentLayout === layout) {
            applyClasses();
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

    async function init(resetLayout = true) {
        isLoading = true;
        posts = [];
        tags = [];
        
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
            } else {
                displayTitle = "";
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
            
            if (resetLayout) {
                const savedLayout = localStorage.getItem("postListLayout");
                const effectiveDefault = window.innerWidth < 780 ? mobileDefaultLayout : defaultLayout;
                const effectiveLayout = (window.innerWidth < 380 ? "grid" : savedLayout) || effectiveDefault;
                
                currentLayoutClass = effectiveLayout === "grid" 
                    ? "post-grid-auto grid-mode" 
                    : "flex flex-col gap-4 md:gap-4 list-mode";
                
                setTimeout(() => {
                    initLayout();
                }, 0);
            }
            
            isLoading = false;
        } catch (error) {
            console.error("Error loading posts:", error);
            isLoading = false;
        }
    }

    onMount(() => {
        // 先更新布局类（解决 SSR 与客户端 hydration 时序问题）
        updateLayoutClass();
        
        // 确保布局容器有正确的初始类
        const postListContainer = document.getElementById("post-list-container");
        if (postListContainer && currentLayoutClass) {
            postListContainer.className = `transition-all duration-500 ease-in-out mb-4 ${currentLayoutClass}`;
        }
        
        init();

        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(initLayout, 250);
        });

        window.addEventListener("layoutChange", (event: any) => {
            const newLayout = event.detail.layout;
            updatePostListLayout(newLayout, true);  // 强制重新应用布局
        });

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                setTimeout(initLayout, 100);
            }
        });

        let previousUrl = window.location.href;
        const checkUrlChange = () => {
            const newUrl = window.location.href;
            if (newUrl !== previousUrl) {
                const prevParams = new URLSearchParams(previousUrl.includes('?') ? previousUrl.split('?')[1] : '');
                const newParams = new URLSearchParams(newUrl.includes('?') ? newUrl.split('?')[1] : '');
                const prevCategory = prevParams.get('category');
                const newCategory = newParams.get('category');
                const prevTag = prevParams.get('tag');
                const newTag = newParams.get('tag');
                const prevUncategorized = prevParams.has('uncategorized');
                const newUncategorized = newParams.has('uncategorized');
                
                if (prevCategory !== newCategory || prevTag !== newTag || prevUncategorized !== newUncategorized) {
                    previousUrl = newUrl;
                    init();
                } else {
                    previousUrl = newUrl;
                }
            }
        };

        window.addEventListener("popstate", checkUrlChange);
        
        const observeUrlChange = () => {
            let lastUrl = window.location.href;
            const observer = new MutationObserver(() => {
                if (window.location.href !== lastUrl) {
                    lastUrl = window.location.href;
                    checkUrlChange();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        };
        
        observeUrlChange();
        
        let pushStateOriginal = window.history.pushState;
        window.history.pushState = function(state: any, title: string, url?: string) {
            const result = pushStateOriginal.call(this, state, title, url);
            setTimeout(checkUrlChange, 0);
            return result;
        };
        
        let replaceStateOriginal = window.history.replaceState;
        window.history.replaceState = function(state: any, title: string, url?: string) {
            const result = replaceStateOriginal.call(this, state, title, url);
            setTimeout(checkUrlChange, 0);
            return result;
        };
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
                    <!-- <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" x2="8" y1="13" y2="13"/>
                        <line x1="16" x2="8" y1="17" y2="17"/>
                        <line x1="10" x2="8" y1="9" y2="9"/>
                    </svg> -->
                   <svg width="1em" height="1em" class="text-3xl text-(--primary)" data-astro-cid-2pzlju63="true" data-icon="material-symbols:folder-open">  <symbol id="ai:material-symbols:folder-open" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h6l2 2h8q.825 0 1.413.588T22 8H4v10l2.4-8h17.1l-2.575 8.575q-.2.65-.737 1.038T19 20z"></path></symbol><use href="#ai:material-symbols:folder-open"></use>  </svg>
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
                <svg width="1em" height="1em" class="text-lg text-(--primary)" data-astro-cid-2pzlju63="true" data-icon="material-symbols:label">   <symbol id="ai:material-symbols:label" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h11q.475 0 .9.213t.7.587L22 12l-5.4 7.2q-.275.375-.7.588T15 20z"></path></symbol><use href="#ai:material-symbols:label"></use>  </svg>
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

    <!-- 立即执行脚本：防止 SSR 与客户端 hydration 时序问题导致的布局闪烁 -->
    <script>
        (function() {
            const defaultLayout = "list";
            const mobileDefaultLayout = "grid";
            
            const savedLayout = localStorage.getItem('postListLayout');
            const effectiveDefault = window.innerWidth < 780 ? mobileDefaultLayout : defaultLayout;
            const effectiveLayout = window.innerWidth < 380 ? 'grid' : (savedLayout || effectiveDefault);

            const container = document.getElementById('post-list-container');
            
            if (container) {
                // 禁用过渡动画
                container.style.transition = 'none';

                // 移除所有布局类
                container.classList.remove('list-mode', 'grid-mode', 'post-grid-auto', 'flex', 'flex-col', 'gap-4', 'md:gap-4');

                if (effectiveLayout === 'grid') {
                    container.classList.add('grid-mode', 'post-grid-auto');
                } else {
                    container.classList.add('list-mode', 'flex', 'flex-col', 'gap-4', 'md:gap-4');
                }

                // 强制重排后恢复过渡动画
                container.offsetHeight;
                container.style.transition = '';
            }
        })();
    </script>

    <!-- 文章列表 - 完全按照 PostCard.astro 的结构 -->
    <div
        id="post-list-container"
        class={`transition-all duration-500 ease-in-out mb-4 ${currentLayoutClass}`}
        data-default-layout={defaultLayout}
        data-mobile-default-layout={mobileDefaultLayout}
        data-masonry-enabled={masonryEnabled}
        data-column-width={columnWidth}
        style={`--post-card-min-width: ${columnWidth}px; --coverWidth: ${coverWidth}; --descriptionClampLines: ${descriptionClampLines};`}
    >
        {#if posts.length > 0}
            {#each posts as entry, index}
                <div
                    class="post-card-wrapper card-base flex flex-col-reverse w-full rounded-(--radius-large) overflow-hidden relative post-card-item
                           {entry.image ? 'has-cover' : 'no-cover'}
                           {entry.pinned ? 'pinned' : ''}"
                    style={`animation-delay: calc(var(--content-delay) + ${index * 50}ms);`}
                >
                    <div
                        class="post-card-content pl-4 md:pl-9 pr-4 md:pr-2 pt-4 md:pt-7 pb-4 md:pb-7 relative flex flex-col h-full
                               {!entry.image ? 'w-full md:w-[calc(100%-52px-12px)]' : ''}"
                    >
                        <a
                            href={getPostUrlBySlug(entry.id)}
                            class="post-card-title transition group w-full block font-bold mb-3 text-3xl text-90
                                hover:text-(--primary) dark:hover:text-(--primary)
                                active:text-(--title-active) dark:active:text-(--title-active)
                                before:w-1 before:h-5 before:rounded-md before:bg-(--primary)
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

                        <!-- PostMetadata -->
                        <div class="post-meta-root flex flex-wrap text-neutral-500 dark:text-neutral-400 items-center gap-4 gap-x-4 gap-y-2 mb-4 post-meta">
                            {#if entry.pinned}
                                <div class="pinned-btn flex items-center gap-1 bg-[var(--btn-regular-bg)] rounded-md px-2 py-1.5 font-bold">
                                    <svg width="1em" height="1em" class="text-xl text-[var(--primary)]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="m6.5 22l-1-1v-4H2v-2l1.5-2.65V10H2V8h9v2H9.5v2.35L11 15v2H7.5v4zm5.5-2v-2h8V6H2q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20z"/>
                                    </svg>
                                    <span class="text-sm text-[var(--primary)]">置顶</span>
                                </div>
                            {/if}
                            <!-- publish date -->
                            <div class="flex items-center">
                                <div class="meta-icon">
                                    <svg width="1em" height="1em" class="text-xl" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V3q0-.425.288-.712T7 2t.713.288T8 3v1h8V3q0-.425.288-.712T17 2t.713.288T18 3v1h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zM5 8h14V6H5zm0 0V6z"/>
                                    </svg>
                                </div>
                                <span class="text-(--content-meta) text-sm font-medium">
                                    {formatDate(entry.published)}
                                </span>
                            </div>
                            <!-- categories -->
                            {#if entry.category}
                                <div class="flex items-center">
                                    <div class="meta-icon">
                                        <svg width="1em" height="1em" class="text-xl" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M6 15.325q.35-.175.725-.25T7.5 15H8V4h-.5q-.625 0-1.062.438T6 5.5zM10 15h8V4h-8zm-4 .325V4zM7.5 22q-1.45 0-2.475-1.025T4 18.5v-13q0-1.45 1.025-2.475T7.5 2H18q.825 0 1.413.587T20 4v12.525q0 .2-.162.363t-.588.362q-.35.175-.55.5t-.2.75t.2.763t.55.487t.55.413t.2.562v.25q0 .425-.288.725T19 22zm0-2h9.325q-.15-.35-.237-.712T16.5 18.5q0-.4.075-.775t.25-.725H7.5q-.65 0-1.075.438T6 18.5q0 .65.425 1.075T7.5 20"/>
                                        </svg>
                                    </div>
                                    <a href={`/archive/?category=${encodeURIComponent(entry.category)}`} class="category-link text-sm font-medium text-(--content-meta) hover:text-(--primary) dark:hover:text-(--primary) whitespace-nowrap relative">
                                        {entry.category}
                                    </a>
                                </div>
                            {/if}
                        </div>

                        <!-- description -->
                        <div
                            class="transition text-(--content) md:pr-4 description grow description-clamped"
                            title={entry.description}
                        >
                            {entry.description}
                        </div>

                        <!-- tags -->
                        {#if showTags}
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
                                    <span class="text-xs text-(--content-meta)">无标签</span>
                                {/if}
                            </div>
                        {/if}
                    </div>

                    {#if entry.image}
                        <a
                            href={getPostUrlBySlug(entry.id)}
                            class="post-card-image group w-full md:w-(--coverWidth) aspect-2/1 md:aspect-auto
                                   relative md:absolute md:top-4 md:bottom-4 md:right-4
                                   rounded-(--radius-large) md:rounded-xl overflow-hidden"
                        >
                            <div class="absolute pointer-events-none z-10 w-full h-full group-hover:bg-black/30 group-active:bg-black/50 transition" />
                            <div class="absolute pointer-events-none z-20 w-full h-full flex items-center justify-center">
                                <div class="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="transition opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 text-white text-2xl md:text-5xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="m9 18 6-6-6-6"/>
                                    </svg>
                                </div>
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
                                   absolute right-3 top-3 bottom-3 rounded-xl bg-(--enter-btn-bg)
                                   hover:bg-(--enter-btn-bg-hover) active:bg-(--enter-btn-bg-active) active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="transition text-(--primary) text-4xl mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

<style define:vars={{ coverWidth, descriptionClampLines }}>
    :global(.post-grid-auto) {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--post-card-min-width, 320px), 1fr));
        gap: 1rem;
    }

    @media (max-width: 767px) {
        :global(.list-mode .post-meta-root) {
            transform: scale(0.72) !important;
            transform-origin: top left !important;
            margin-bottom: 0.25rem !important;
            width: 139% !important;
        }
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

    .description-clamped {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        -webkit-line-clamp: var(--descriptionClampLines);
        line-clamp: var(--descriptionClampLines);
    }

    /* === 分类链接 hover 色块效果 === */
    .category-link {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: all 0.2s ease;
        z-index: 1;
        background-color: transparent;
    }

    .category-link:hover {
        background-color: var(--btn-regular-bg);
        color: var(--primary) !important;
    }

    /* === 列表模式移动端样式 === */
    :global(.list-mode) .post-card-wrapper {
        flex-direction: row !important;
    }

    :global(.list-mode) .has-cover .post-card-content {
        width: calc(100% - 9rem - 0.75rem) !important;
        padding: 0.75rem 0.5rem 0.75rem 0.75rem !important;
    }

    :global(.list-mode) .has-cover .post-card-image {
        position: absolute !important;
        top: 0.5rem !important;
        bottom: 0.5rem !important;
        right: 0.5rem !important;
        width: 9rem !important;
        aspect-ratio: auto !important;
        border-radius: 0.75rem !important;
    }

    :global(.list-mode) .post-card-title {
        font-size: 1.125rem !important;
        line-height: 1.75rem !important;
        margin-bottom: 0.5rem !important;
    }

    :global(.list-mode) .post-card-title::before {
        display: none !important;
    }

    :global(.list-mode) .stats {
        gap: 0.25rem !important;
    }

    :global(.list-mode) .no-cover .post-card-content {
        width: calc(100% - 52px - 12px) !important;
    }

    :global(.list-mode) .post-card-enter-btn {
        display: flex !important;
    }

    :global(.list-mode) .stats a {
        font-size: 0.65rem !important;
        padding: 0.125rem 0.375rem !important;
        height: 1.25rem !important;
    }

    /* === 列表模式桌面端样式 === */
    @media (min-width: 768px) {
        :global(.list-mode) .post-card-wrapper {
            flex-direction: row !important;
        }

        :global(.list-mode) .has-cover .post-card-content {
            width: calc(100% - var(--coverWidth) - 1.5rem) !important;
            padding: 1.75rem 0.5rem 1.75rem 2.25rem !important;
        }

        :global(.list-mode) .has-cover .post-card-image {
            top: 1rem !important;
            bottom: 1rem !important;
            right: 1rem !important;
            width: var(--coverWidth) !important;
            border-radius: 0.75rem !important;
        }

        :global(.list-mode) .post-card-title {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
            margin-bottom: 0.75rem !important;
        }

        :global(.list-mode) .post-card-title::before {
            display: block !important;
            top: 2.25rem !important;
            height: 1rem !important;
        }

        :global(.list-mode) .description {
            font-size: inherit !important;
        }

        :global(.list-mode) .stats a {
            font-size: 0.75rem !important;
            padding: 0.25rem 0.5rem !important;
            height: 1.5rem !important;
        }

        :global(.list-mode) .no-cover .post-card-content {
            width: calc(100% - 52px - 12px) !important;
        }

        :global(.list-mode) .post-card-enter-btn {
            display: flex !important;
        }
    }

    /* === 网格模式样式 === */
    :global(.grid-mode) .post-card-wrapper {
        flex-direction: column-reverse !important;
        height: 100% !important;
        justify-content: flex-end !important;
    }

    :global(.grid-mode) .post-card-content {
        width: 100% !important;
        height: auto !important;
        flex-grow: 1 !important;
        padding: 1rem !important;
    }

    :global(.grid-mode) .post-card-image {
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

    :global(.grid-mode) .description {
        flex-grow: 0 !important;
    }

    :global(.grid-mode) .stats {
        margin-top: auto !important;
    }

    :global(.grid-mode) .has-cover .post-card-content {
        padding-top: 0.8rem !important;
    }

    :global(.grid-mode) .has-cover .post-card-title::before {
        top: 1.3rem !important;
    }

    :global(.grid-mode) .no-cover .post-card-content {
        width: calc(100% - 52px - 12px) !important;
        padding-right: 4.5rem !important;
    }

    :global(.grid-mode) .post-card-enter-btn {
        display: flex !important;
    }

    :global(.grid-mode) .post-card-title {
        font-size: 1.35rem !important;
        line-height: 1.75rem !important;
        margin-bottom: 0.5rem !important;
    }

    :global(.grid-mode) .post-card-title::before {
        display: none !important;
    }

    :global(.grid-mode) .post-meta {
        margin-bottom: 0.5rem !important;
        gap: 0.5rem !important;
    }

    :global(.grid-mode) .post-meta .text-xl {
        font-size: 1rem !important;
        line-height: 1.25rem !important;
    }

    :global(.grid-mode) .meta-icon {
        width: 1.5rem !important;
        height: 1.5rem !important;
        margin-right: 0.25rem !important;
    }

    :global(.grid-mode) .post-meta .text-sm {
        font-size: 0.75rem !important;
        line-height: 1rem !important;
    }

    :global(.grid-mode) .post-meta .pinned-btn {
        padding: 0.25rem 0.375rem !important;
    }
</style>