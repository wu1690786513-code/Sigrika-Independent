// 外部笔记数据源配置（基于 GitHub Gist）
// 每个笔记本有独立的 Gist 仓库

export const externalNotebooksConfig = {
    // 是否启用外部笔记数据源
    enable: true,

    // 每个笔记本对应的 Gist ID
    // 在 https://gist.github.com 创建 Secret Gist，文件名 notebooks-entries.json，内容 []
    notebookGists: {
        "每日总结": "your-gist-id-here",
        "日记": "your-gist-id-here",
        "日常琐记": "your-gist-id-here",
        "学习笔记": "your-gist-id-here",
    } as Record<string, string>,

    // 笔记模板（Admin 页面快速选择）
    // {name} 会被替换为今天的日期
    templates: [
        {
            id: "daily",
            icon: "📝",
            name: "每日总结",
            title: "{name} 每日总结",
            content: "📍今天做了什么：\n📅今日感想：\n🔮明日计划：",
        },
        {
            id: "diary",
            icon: "📔",
            name: "日记",
            title: "{name}",
            content: "## 天气\n\n## 今天发生了什么\n\n## 心情\n\n",
        },
        {
            id: "reading",
            icon: "📚",
            name: "读书笔记",
            title: "",
            content: "## 📚 书籍信息\n\n- 书名：\n- 作者：\n\n## 核心观点\n\n## 我的感想\n\n",
        },
        {
            id: "free",
            icon: "📄",
            name: "空白",
            title: "",
            content: "",
        },
    ] as Array<{
        id: string;
        icon: string;
        name: string;
        title: string;
        content: string;
    }>,

    // 后台登录密码的 SHA-256 哈希（与朋友圈后台共用同一密码）
    adminPasswordHash:
        "bb89d94003ac1c7a8b02df994462bbff2c654af0f64074458ea8450da3704eaa",

    // GitHub Token
    githubToken: process.env.GITHUB_TOKEN || "",
};