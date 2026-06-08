# GraphView Tooltip 样式丢失问题分析

## 问题现象

当把 tooltip 相关样式放在 Astro 组件的局部 `<style>` 块中时，部分样式（描述、分页按钮、标签等）无法生效，导致卡片渲染不完整。

## 根本原因

**Astro 的样式作用域化机制**：

### 静态 DOM vs 动态 DOM

| 类型 | 加载方式 | 是否带 `data-astro-cid` | 样式生效方式 |
|------|----------|------------------------|--------------|
| **静态 DOM** | Astro 模板编译时生成 | ✅ 是 | 普通 scoped 样式生效 |
| **动态 DOM** | JavaScript 运行时 `innerHTML` 创建 | ❌ 否 | 需要 `:global()` |

### 具体分析

1. **静态容器**（正常工作）：
```html
<div id="graphTooltipPost" class="graph-tooltip graph-tooltip-post hidden">
  <div class="tooltip-card tooltip-card-post">...</div>
</div>
```
这些元素在 Astro 编译时生成，会自动带上 `data-astro-cid-xxx` 属性，因此普通 scoped 样式可以匹配。

2. **动态内容**（样式丢失）：
```javascript
// showTagTooltip 函数中动态生成
tooltipPostsTag.innerHTML = `
  <div class="post-item">...</div>
  <div class="tooltip-pagination">
    <span class="pagination-btn">‹</span>
  </div>
`;
```
这些元素是运行时通过 JavaScript 创建的，**不会带 `data-astro-cid` 属性**。

### Astro 样式作用域化原理

Astro 的 scoped 样式会被编译为：
```css
/* 编译前 */
.post-item { color: red; }

/* 编译后 */
.post-item[data-astro-cid-abc123] { color: red; }
```

由于动态生成的元素没有 `data-astro-cid-abc123` 属性，所以样式无法匹配！

## 需要使用 `:global()` 的元素

以下选择器对应的元素是动态生成的，需要包裹在 `:global()` 中：

| 选择器 | 用途 | 生成位置 |
|--------|------|----------|
| `.post-item` | 文章列表项 | `showTagTooltip` |
| `.post-number` | 文章序号 | `showTagTooltip` |
| `.post-title` | 文章标题 | `showTagTooltip` |
| `.tooltip-pagination` | 分页容器 | `showTagTooltip` |
| `.pagination-btn` | 分页按钮 | `showTagTooltip` |
| `.pagination-info` | 分页信息 | `showTagTooltip` |
| `.post-description` | 文章描述 | `showPostTooltip` |
| `.tags-list` | 标签列表 | `showPostTooltip` |
| `.tag-item` | 标签项 | `showPostTooltip` |
| `.tag-clickable` | 可点击标签 | `showPostTooltip` |
| `.category-clickable` | 可点击分类 | `showPostTooltip` |
| `.empty-state` | 空状态 | `showTagTooltip` |

## 解决方案

### 方案一：使用 `:global()` 包裹动态元素样式（推荐）

```css
/* 静态容器 - 普通样式即可 */
.tooltip-card-post {
  background: ...;
}

/* 动态内容 - 需要 :global() */
:global(.post-item) {
  display: flex;
  ...
}
:global(.post-item:hover) {
  background: ...;
}
:global(.pagination-btn) {
  ...
}
```

### 方案二：使用 `<style is:global>` 整段声明

```css
<style is:global>
  .post-item { ... }
  .pagination-btn { ... }
  /* 所有动态元素样式 */
</style>
```

### 方案三：混合使用

```css
<style>
  /* 静态元素样式 - scoped */
  .tooltip-card-post { ... }
  .tooltip-close { ... }
  
  /* 动态元素样式 - global */
  :global(.post-item) { ... }
  :global(.pagination-btn) { ... }
</style>
```

## 代码修改说明

已在 `GraphView.astro` 中修复，将以下动态元素样式改为 `:global()`：

1. `.post-item` 及其 hover 状态
2. `.post-number`
3. `.post-title` 及其伪元素和 hover 状态
4. `.tooltip-pagination`
5. `.pagination-btn` 及其 hover 状态
6. `.pagination-info`
7. `.post-description` 及其伪元素
8. `.empty-state`
9. `.tags-list`
10. `.tag-item`
11. `.tag-clickable:hover`
12. `.category-clickable:hover`

## 总结

**关键原则**：

> **静态 DOM 用普通样式，动态 DOM 用 `:global()`**

在 Astro 组件中：
- 模板中手写的静态元素 → 普通 scoped 样式
- JavaScript 动态创建的元素 → 需要 `:global()` 或 `<style is:global>`

这是 Astro 样式作用域化机制的正常行为，并非 bug。
