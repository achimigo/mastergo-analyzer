# MasterGo Analyzer Skill

将 MasterGo 设计原型转换为前端代码的完整工作流。

---

## 功能概述

通过无头浏览器自动分析 MasterGo 原型，提取设计令牌、布局结构和样式信息，解决 Claude Code 无法直接看图的问题。

---

## 子命令

| 命令 | 功能 | 使用场景 |
|------|------|---------|
| `/mastergo` | 整页分析 | 从零实现完整页面 |
| `/mastergo-element` | 元素分析 | 修改特定组件 |
| `/mastergo-auth` | 认证分析 | 需要登录的页面 |
| `/mastergo-cookie` | Cookie 提取 | 获取认证 Cookie |

---

## 快速开始

### 首次使用（安装依赖）

```bash
# 加载快捷命令
source ~/.bashrc

# 检查依赖
mastergo-analyze
# 如提示安装，按提示操作
```

### 分析整页设计

```bash
/mastergo <url>

# 示例
/mastergo https://mastergo.com/xxx/yyy
```

### 分析特定组件

```bash
/mastergo-element <url> <selector>

# 示例
/mastergo-element https://mastergo.com/xxx/yyy ".submit-btn"
```

### 需要登录的页面

```bash
# 方式 1：使用 Cookie
/mastergo-auth --cookie-file ~/.mastergo/cookie.txt <url>

# 方式 2：使用配置文件（推荐）
/mastergo-auth --profile ~/.mastergo/profile <url>
```

---

## 在 Claude Code 中的工作流

### 整页实现

```
用户：/mastergo https://mastergo.com/xxx/yyy

（等待分析完成）

用户：请根据 mastergo-output/ 中的数据实现这个页面
     - 使用 React + Tailwind CSS
     - 精确还原设计稿的布局和样式
```

### 组件修改

```
用户：/mastergo-element https://mastergo.com/xxx/yyy ".user-card"

（等待分析完成）

用户：请找到 src/components/UserCard.tsx
     根据 mastergo-element-output/element-info.json 调整样式
```

### 需要登录的设计

```
用户：/mastergo-cookie
（按提示获取并保存 Cookie）

用户：/mastergo-auth --cookie-file ~/.mastergo/cookie.txt https://mastergo.com/xxx

用户：请实现这个页面...
```

---

## 输出文件说明

### 整页分析 (`/mastergo`)

```
mastergo-output/
├── screenshot.png           # 完整页面截图
├── analysis.json            # DOM 结构 + 样式
└── design-tokens.json       # 设计令牌
```

### 元素分析 (`/mastergo-element`)

```
mastergo-element-output/
├── element-highlight.png    # 带高亮的元素截图
├── element-original.png     # 原始元素截图
├── element-info.json        # 元素详细信息
├── element.css              # CSS 代码片段
└── element.tailwind.txt     # Tailwind 类名
```

---

## 提示词模板

### 从零实现整页

```
根据 mastergo-output/ 中的数据实现这个页面：

1. 查看 screenshot.png 了解整体布局
2. 读取 design-tokens.json 获取设计系统
3. 根据 analysis.json 实现 HTML 结构

技术栈：React + Tailwind CSS
要求：
- 响应式设计
- 精确还原间距和颜色
- 组件化拆分
```

### 修改现有组件

```
对比 mastergo-element-output/element-info.json 和当前代码：

1. 找出样式差异
2. 生成修改方案
3. 应用修改

当前组件：src/components/xxx.tsx
```

### 新建组件

```
根据 mastergo-element-output/element-info.json 创建新组件：

组件名：SubmitButton
位置：src/components/SubmitButton.tsx
要求：
- TypeScript
- 支持 loading 状态
- 精确还原设计稿
```

---

## 认证方案

| 方案 | 命令 | 适用场景 |
|------|------|---------|
| 公开分享 | `/mastergo <share-url>` | 有分享权限 |
| Cookie | `/mastergo-auth --cookie-file` | 临时使用 |
| 配置文件 | `/mastergo-auth --profile` | 长期使用 |

详见：`~/.claude/docs/mastergo-auth-guide.md`

---

## 故障排除

### 问题：命令找不到

```bash
# 加载配置
source ~/.bashrc

# 检查是否安装
which mastergo-analyze
```

### 问题：依赖未安装

```bash
# 安装 Playwright
cd ~/.claude/bin
npm install
npx playwright install chromium
```

### 问题：元素找不到

```bash
# 在浏览器中验证选择器
# F12 → Console → 运行：
document.querySelector('.your-selector')

# 尝试更简单的选择器
/mastergo-element <url> "button"  # 而不是复杂路径
```

---

## 高级用法

### 批量分析

```bash
# 分析多个页面
for url in url1 url2 url3; do
  /mastergo $url
done

# 分析多个组件
/components=(header nav footer)
for c in "${components[@]}"; do
  /mastergo-element <url> ".$c"
done
```

### 对比版本

```bash
# 分析旧版本
/mastergo-element <old-url> ".card" ./old

# 分析新版本
/mastergo-element <new-url> ".card" ./new

# 对比差异
diff ./old/element-info.json ./new/element-info.json
```

---

## 相关文件

- 工具脚本：`~/.claude/bin/mastergo-*`
- 使用文档：`~/.claude/docs/mastergo-*.md`
- 配置文件：`~/.mastergo/`

---

## 依赖要求

- Node.js >= 18
- Playwright
- Chromium 浏览器

---

**版本**: 1.0.0
**创建日期**: 2026-03-28
