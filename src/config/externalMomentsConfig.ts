// 外部朋友圈数据源配置（基于 GitHub Gist，完全免费）
// 数据存储在 GitHub Gist 中，通过 GitHub API 读写

export const externalMomentsConfig = {
    // 是否启用外部朋友圈数据源
    enable: true,

    // GitHub Gist ID（创建 Gist 后从 URL 中获取）
    // 替换为你的 Gist ID。https://gist.github.com/Seasir-Hyde/xxxx，其中 xxxx 即为 Gist ID
    gistId: "dc53fe5b52c85254db8488ed1ea93aca",

    // Gist 中的文件名
    fileName: "moments.json",

    // 默认作者信息
    defaultAuthor: "Sigrika",
    defaultAvatar: "https://qwq.sigrika.cc/assets/images/sigrika-avatar.jpg",

    // 后台登录密码的 SHA-256 哈希
    // 生成方式：在线工具:https://www.strongpasswordgenerator.org/zh-cn/sha256-hash-generator/
    adminPasswordHash:
        "bb89d94003ac1c7a8b02df994462bbff2c654af0f64074458ea8450da3704eaa",

    // GitHub Token（优先从环境变量 GITHUB_TOKEN 读取）
    githubToken: process.env.GITHUB_TOKEN || "",
};