#!/usr/bin/env bash
#
# MasterGo 依赖检查库
# 用法：source common/check-dependencies.sh && check_dependencies
#

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_tip() { echo -e "${YELLOW}[TIP]${NC} $1"; }

# 获取脚本所在目录
get_script_dir() {
    local source="${BASH_SOURCE[1]:-${BASH_SOURCE[0]}}"
    dirname "$(cd "$(dirname "$source")" && pwd)"
}

# 检查 Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js (v18+)"
        echo "  下载地址：https://nodejs.org/"
        return 1
    fi

    local node_version=$(node -v 2>&1 | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js 版本过低 (当前：$(node -v)), 需要 v18+"
        return 1
    fi

    print_status "Node.js 已安装：$(node -v)"
    return 0
}

# 检查 Playwright 是否已安装
check_playwright_installed() {
    local script_dir="$1"

    # 检查本地 node_modules
    if [ -d "$script_dir/node_modules/playwright" ]; then
        print_status "Playwright 已安装 (本地)"
        return 0
    fi

    # 检查全局安装
    if npm list -g playwright &>/dev/null; then
        print_status "Playwright 已安装 (全局)"
        return 0
    fi

    return 1
}

# 检查 Chromium 浏览器是否已安装
check_chromium_installed() {
    local playwright_cache_dir="$HOME/.cache/ms-playwright"

    # 检查 Playwright 缓存目录
    if [ -d "$playwright_cache_dir" ]; then
        # 检查是否有 Chromium 目录
        local chromium_dirs=$(ls -d "$playwright_cache_dir"/chromium-* 2>/dev/null | wc -l)
        if [ "$chromium_dirs" -gt 0 ]; then
            print_status "Chromium 浏览器已安装"
            return 0
        fi
    fi

    return 1
}

# 安装 Playwright
install_playwright() {
    local script_dir="$1"
    print_status "安装 Playwright..."
    cd "$script_dir"
    npm install
    cd - > /dev/null
    print_success "Playwright 安装完成"
}

# 安装 Chromium 浏览器
install_chromium() {
    local script_dir="$1"
    print_status "安装 Chromium 浏览器..."
    cd "$script_dir"
    npx playwright install chromium
    cd - > /dev/null
    print_success "Chromium 安装完成"
}

# 主检查函数
# 参数：脚本所在目录
check_dependencies() {
    local script_dir="${1:-$(dirname "${BASH_SOURCE[0]}")}"

    echo ""
    print_status "检查依赖..."

    # 检查 Node.js
    if ! check_node; then
        exit 1
    fi

    # 检查 Playwright
    if ! check_playwright_installed "$script_dir"; then
        install_playwright "$script_dir"
    fi

    # 检查 Chromium 浏览器
    if ! check_chromium_installed; then
        install_chromium "$script_dir"
    fi

    echo ""
    print_success "依赖检查完成"
}
