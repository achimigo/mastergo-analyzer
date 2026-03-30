# MasterGo Analyzer

**版本**: 1.0.0
**作者**: RuFlo Team
**日期**: 2026-03-28

## 描述

将 MasterGo 设计原型自动转换为前端代码的分析工具。

通过无头浏览器（Playwright）访问 MasterGo 原型，提取：
- 完整页面截图
- DOM 结构和计算样式
- 设计令牌（颜色/字体/间距）
- 特定元素的详细信息

解决 Claude Code 无法直接看图的问题，实现精准的设计还原。

## 功能特性

- ✅ 整页分析 - 完整页面从零实现
- ✅ 元素分析 - 精准分析特定组件
- ✅ 认证支持 - Cookie/配置文件登录
- ✅ 设计令牌 - 自动提取颜色/字体/间距
- ✅ 代码生成 - CSS 和 Tailwind 代码片段
- ✅ 截图标注 - 高亮显示目标元素

## 安装要求

- Node.js >= 18
- npm
- Playwright（自动安装）
- Chromium 浏览器（自动安装）

## 📦 安装

### Linux / macOS

```bash
# 1. 克隆仓库
git clone https://github.com/achimigo/mastergo-analyzer.git
cd mastergo-analyzer

# 2. 运行安装脚本
source install.sh

# 3. 加载配置
source ~/.bashrc  # 或 source ~/.zshrc
```

### Windows

**方式 1: 使用批处理文件（推荐）**

```cmd
# 1. 克隆仓库
git clone https://github.com/achimigo/mastergo-analyzer.git
cd mastergo-analyzer

# 2. 双击运行 install.bat
install.bat

# 3. 加载环境变量
call setenv.bat
```

**方式 2: 使用 PowerShell**

```powershell
# 1. 克隆仓库
git clone https://github.com/achimigo/mastergo-analyzer.git
cd mastergo-analyzer

# 2. 运行安装脚本
.\install.ps1

# 3. 加载配置
. .\setenv.ps1
```

### 依赖说明

安装脚本会自动检查和安装：
- ✅ Node.js v18+（如未安装会提示）
- ✅ Playwright（本地或全局）
- ✅ Chromium 浏览器（~200MB，全局缓存）

如果系统中已有 Playwright 或 Chromium，会自动复用，不会重复安装。

## 快速开始

```bash
# 1. 加载配置
source ~/.bashrc

# 2. 分析整页
/mastergo https://mastergo.com/xxx/yyy

# 3. 分析元素
/mastergo-element https://mastergo.com/xxx/yyy ".button"

# 4. 在 Claude Code 中实现
# → 读取输出目录中的 JSON 和截图
```

## 命令列表

| 命令 | 功能 |
|------|------|
| `/mastergo` | 整页分析 |
| `/mastergo-element` | 元素分析 |
| `/mastergo-auth` | 认证分析 |
| `/mastergo-cookie` | Cookie 提取 |

## 使用示例

### 从零实现整页

```bash
/mastergo https://mastergo.com/xxx/yyy
```

在 Claude Code 中：
```
请根据 mastergo-output/ 实现这个页面
- 使用 React + Tailwind CSS
- 精确还原设计稿
```

### 修改现有组件

```bash
/mastergo-element https://mastergo.com/xxx/yyy ".submit-btn"
```

在 Claude Code 中：
```
请找到 src/components/SubmitButton.tsx
根据 element-info.json 调整样式
```

### 需要登录的页面

```bash
# 首次设置配置文件
/mastergo-auth --profile ~/.mastergo/profile

# 之后直接使用
/mastergo --profile ~/.mastergo/profile <url>
```

## 输出文件

### Claude Code Skill 集成

**1. 安装 Skill**

```bash
# 方式 1: 使用 install.sh 脚本
./install.sh

# 方式 2: 手动配置
ln -s $(pwd)/skills/mastergo-analyzer ~/.claude/skills/mastergo-analyzer
```

**2. Skill 文件结构**

```
skills/mastergo-analyzer/
├── skill.json      # Skill 配置 (命令定义、工作流)
├── command.md      # 命令使用指南
├── SKILL.md        # Skill 简介
└── docs/           # 详细文档
```

**3. 可用的 Skill 命令**

| 命令 | 功能 | 使用场景 |
|------|------|---------|
| `/mastergo` | 整页分析 | 从零实现完整页面 |
| `/mastergo-element` | 元素分析 | 修改特定组件 |
| `/mastergo-auth` | 认证分析 | 需要登录的页面 |
| `/mastergo-cookie` | Cookie 提取 | 获取认证 Cookie |

**4. 典型工作流**

```
# 整页实现
/mastergo <url>
→ 等待分析完成
→ "请根据 mastergo-output/ 实现这个页面"

# 组件修改
/mastergo-element <url> <selector>
→ 等待分析完成
→ "请根据 element-info.json 调整样式"
```

---

## 输出文件

### 整页分析

```
mastergo-output/
├── screenshot.png         # 页面截图
├── analysis.json          # DOM + 样式
└── design-tokens.json     # 设计令牌
```

### 元素分析

```
mastergo-element-output/
├── element-highlight.png  # 高亮截图
├── element-original.png   # 原始截图
├── element-info.json      # 元素信息
├── element.css            # CSS 代码
└── element.tailwind.txt   # Tailwind 类名
```

## 技术原理

```
MasterGo URL
    ↓
Playwright (Chromium)
    ↓
渲染页面 → 执行 JS → 获取计算样式
    ↓
getBoundingClientRect() → 布局
getComputedStyle() → 样式
    ↓
结构化 JSON + 截图
    ↓
Claude Code 读取 → 生成代码
```

## 认证方案

| 方案 | 适用场景 |
|------|---------|
| 公开分享链接 | 有分享权限 |
| Cookie 文件 | 临时使用 |
| 浏览器配置 | 长期使用 |

详见：`~/.claude/docs/mastergo-auth-guide.md`

## 故障排除

**问题：命令找不到**
```bash
source ~/.bashrc
```

**问题：元素找不到**
- 在浏览器验证选择器
- 尝试更简单的选择器

**问题：需要登录**
- 使用分享链接
- 或使用 `/mastergo-auth`

## 相关文档

- 认证指南：`~/.claude/docs/mastergo-auth-guide.md`
- 元素分析器：`~/.claude/docs/mastergo-element-analyzer.md`
- 整页分析器：`~/.claude/docs/mastergo-analyzer.md`

## 许可证

MIT License

## 支持

GitHub: https://github.com/ruvnet/claude-flow
