#!/usr/bin/env bash
#
# MasterGo Analyzer 上传到 GitHub 脚本
# 用法：./upload-to-github.sh <repository-name>
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_NAME="${1:-mastergo-analyzer}"
REPO_DIR="$SCRIPT_DIR"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

echo "========================================"
echo "  MasterGo Analyzer GitHub 上传工具"
echo "========================================"
echo ""

# 检查 git
if ! command -v git &> /dev/null; then
    print_error "git 未安装，请先安装 git"
    exit 1
fi

# 检查 gh CLI（可选）
HAS_GH=false
if command -v gh &> /dev/null; then
    HAS_GH=true
    print_status "检测到 GitHub CLI"
else
    print_warning "未检测到 GitHub CLI，将使用网页方式创建仓库"
fi

cd "$REPO_DIR"

# 初始化 git（如果还没有）
if [ ! -d ".git" ]; then
    print_status "初始化 git 仓库..."
    git init
else
    print_status "git 仓库已存在"
fi

# 配置用户信息（如果没有）
if [ -z "$(git config user.name)" ]; then
    print_status "配置 git 用户信息..."
    git config user.name "Your Name"
    git config user.email "your.email@example.com"
    echo "提示：请修改为真实信息："
    echo "  git config user.name \"Your Name\""
    echo "  git config user.email \"your.email@example.com\""
fi

# 添加文件
print_status "添加文件..."
git add -A

# 查看状态
git status

# 创建提交
print_status "创建初始提交..."
git commit -m "Initial commit: MasterGo Analyzer v1.0.0

- 整页分析功能
- 元素分析功能
- Cookie/配置文件认证
- CSS/Tailwind代码生成
- Claude Code Skill 支持

Co-Authored-By: claude-flow <ruv@ruv.net>"

# 创建分支
print_status "创建 main 分支..."
git branch -M main

# 创建 GitHub 仓库
echo ""
echo "请选择创建仓库的方式:"
echo "  1) 使用 GitHub CLI (gh)"
echo "  2) 手动在 GitHub 网站创建"
echo "  3) 跳过创建（已有仓库）"
echo ""

if [ "$HAS_GH" = true ]; then
    read -p "请选择 (1-3): " choice
else
    read -p "请选择 (2-3): " choice
fi

case "$choice" in
    1)
        if [ "$HAS_GH" = true ]; then
            print_status "创建 GitHub 仓库..."
            gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
            print_success "仓库创建成功！"
            echo ""
            echo "仓库 URL: https://github.com/$(gh api user | jq -r .login)/$REPO_NAME"
        else
            print_error "未安装 GitHub CLI"
            exit 1
        fi
        ;;
    2)
        echo ""
        print_status "请在 GitHub 上创建新仓库:"
        echo "  1. 访问 https://github.com/new"
        echo "  2. 仓库名：$REPO_NAME"
        echo "  3. 可见性：Public"
        echo "  4. 不要勾选「添加 README」"
        echo ""
        read -p "创建完成后按回车继续..."

        read -p "请输入完整的 git remote 地址： " remote_url
        git remote add origin "$remote_url"

        print_status "推送到 GitHub..."
        git push -u origin main

        echo ""
        print_success "推送成功！"
        echo "仓库 URL: $remote_url"
        ;;
    3)
        read -p "请输入完整的 git remote 地址： " remote_url
        git remote add origin "$remote_url"

        print_status "推送到 GitHub..."
        git push -u origin main

        echo ""
        print_success "推送成功！"
        echo "仓库 URL: $remote_url"
        ;;
    *)
        print_error "无效选择"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "  上传完成!"
echo "========================================"
echo ""
print_status "后续步骤:"
echo "  1. 更新 README.md 中的仓库链接"
echo "  2. 更新 package.json 中的 repository 字段"
echo "  3. 在 GitHub 上添加主题标签 (tags)"
echo "  4. 考虑添加 GitHub Actions CI/CD"
echo ""
