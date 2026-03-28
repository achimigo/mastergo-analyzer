#!/usr/bin/env bash
#
# MasterGo 分析器 - 安装脚本
# 用法：source install.sh
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================="
echo "  MasterGo Analyzer 安装脚本"
echo "========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js 未安装"
    echo "  请下载并安装：https://nodejs.org/"
    exit 1
fi

echo "[INFO] Node.js 版本：$(node -v)"

# 检查 Playwright
if [ -d "$SCRIPT_DIR/node_modules/playwright" ]; then
    echo "[INFO] Playwright 已安装 (本地)"
elif npm list -g playwright &>/dev/null; then
    echo "[INFO] Playwright 已安装 (全局)"
else
    echo "[INFO] 安装 Playwright..."
    cd "$SCRIPT_DIR"
    npm install
    echo "[SUCCESS] Playwright 安装完成"
fi

# 检查 Chromium 浏览器
CHROMIUM_DIR="$HOME/.cache/ms-playwright"
if [ -d "$CHROMIUM_DIR" ] && [ "$(ls -d $CHROMIUM_DIR/chromium-* 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "[INFO] Chromium 浏览器已安装"
else
    echo "[INFO] 安装 Chromium 浏览器..."
    cd "$SCRIPT_DIR"
    npx playwright install chromium
    echo "[SUCCESS] Chromium 安装完成"
fi

# 配置快捷命令
echo ""
echo "[INFO] 配置快捷命令..."

# 检测 shell 类型
if [ -f "$HOME/.bashrc" ]; then
    PROFILE="$HOME/.bashrc"
elif [ -f "$HOME/.zshrc" ]; then
    PROFILE="$HOME/.zshrc"
else
    echo "[WARNING] 未找到 .bashrc 或 .zshrc"
    PROFILE="$HOME/.bashrc"
fi

# 添加别名
ALIASES='
# MasterGo Analyzer
export MASTERGO_ANALYZER_PATH="'"$SCRIPT_DIR"'"
alias mastergo-analyze="$MASTERGO_ANALYZER_PATH/bin/mastergo-analyze"
alias mastergo-element="$MASTERGO_ANALYZER_PATH/bin/mastergo-element"
alias mastergo-auth="$MASTERGO_ANALYZER_PATH/bin/mastergo-auth"
alias mastergo-cookie="$MASTERGO_ANALYZER_PATH/bin/mastergo-cookie-extract.js"
'

if ! grep -q "MASTERGO_ANALYZER_PATH" "$PROFILE" 2>/dev/null; then
    echo "$ALIASES" >> "$PROFILE"
    echo "[SUCCESS] 快捷命令已添加到 $PROFILE"
    echo "  运行 'source $PROFILE' 使其生效"
else
    echo "[INFO] 快捷命令已配置"
fi

echo ""
echo "========================================="
echo "  安装完成!"
echo "========================================="
echo ""
echo "使用方法:"
echo "  source $PROFILE"
echo "  mastergo-analyze <url>"
echo "  mastergo-element <url> <selector>"
echo ""
