import os
import shutil
import subprocess

# ===================== 【配置区】 =====================
MAIN_SITE = r"Z:\Codes\西格莉卡\Firefly"
SUB_SITES = [
    r"Z:\Codes\西格莉卡\Mizuki",
]
SYNC_FOLDER = r"src\content"


# ======================================================


def run_vercel_deploy(path):
    print(f"\n🚀 正在部署：{path}")
    os.chdir(path)

    # ✅ 修复：Windows 必须用 cmd 运行 vercel
    subprocess.run(
        ["cmd", "/c", "vercel --prod"],
        check=True,
        shell=True
    )


def sync_content(src, dst):
    print(f"\n🔁 同步内容：{src} → {dst}")
    if os.path.exists(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def main():
    print("=" * 50)
    print("        西格莉卡 多站点自动同步部署工具")
    print("=" * 50)

    src_content = os.path.join(MAIN_SITE, SYNC_FOLDER)

    # 同步所有副站
    for sub in SUB_SITES:
        dst_content = os.path.join(sub, SYNC_FOLDER)
        sync_content(src_content, dst_content)

    # 部署主站
    run_vercel_deploy(MAIN_SITE)

    # 部署副站
    for sub in SUB_SITES:
        run_vercel_deploy(sub)

    print("\n✅ 所有站点同步 + 部署完成！")


if __name__ == "__main__":
    main()