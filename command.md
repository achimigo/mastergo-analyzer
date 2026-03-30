# MasterGo Analyzer - Claude Code Skill

将 MasterGo 设计原型自动转换为前端代码的分析工具。

## 命令列表

| 命令 | 功能 | 使用场景 |
|------|------|---------|
| `/mastergo` | 整页分析 | 从零实现完整页面 |
| `/mastergo-element` | 元素分析 | 修改特定组件 |
| `/mastergo-auth` | 认证分析 | 需要登录的页面 |
| `/mastergo-cookie` | Cookie 提取 | 获取认证 Cookie |

## 快速开始

### 1. 分析整页设计

```bash
/mastergo <url>

# 示例
/mastergo https://mastergo.com/xxx/yyy
```

**输出文件**:
```
mastergo-output/
├── screenshot.png         # 完整页面截图
├── analysis.json          # DOM 结构 + 样式
└── design-tokens.json     # 设计令牌
```

### 2. 分析特定组件

```bash
/mastergo-element <url> <selector>

# 示例
/mastergo-element https://mastergo.com/xxx/yyy ".submit-btn"
```

**输出文件**:
```
mastergo-element-output/
├── element-highlight.png  # 带高亮的元素截图
├── element-original.png   # 原始元素截图
├── element-info.json      # 元素详细信息
├── element.css            # CSS 代码片段
└── element.tailwind.txt   # Tailwind 类名
```

### 3. 需要登录的页面

```bash
# 方式 1: 使用 Cookie 文件
/mastergo-auth --cookie-file ~/.mastergo/cookie.txt <url>

# 方式 2: 使用浏览器配置文件 (推荐)
/mastergo-auth --profile ~/.mastergo/profile <url>

# 方式 3: 交互模式
/mastergo-auth --interactive
```

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

### 获取 Cookie (首次使用)

```
用户：/mastergo-cookie

（按提示在浏览器中获取 Cookie 并保存）
```

## 设计令牌提取

自动提取以下内容：

- **颜色**: 所有使用的颜色值 (背景色、文字色等)
- **字体**: 字体系列、大小、粗细
- **间距**: margin、padding、gap 值
- **布局**: display、position、flex、grid 属性

## 故障排除

### 命令找不到
```bash
source ~/.bashrc
which mastergo-analyze
```

### 元素找不到
1. 在浏览器中验证选择器 (F12 → Console → `document.querySelector('.your-selector')`)
2. 尝试更简单的选择器
3. 确认页面已完全加载

### 需要登录
- 使用分享链接 (如果有公开权限)
- 使用 `/mastergo-auth` 进行认证

## 技术栈要求

- Node.js >= 18
- Playwright (自动安装)
- Chromium 浏览器 (自动安装)

## 相关文档

- 完整文档：`README.md`
- 认证指南：`docs/mastergo-auth-guide.md`
- 上传指南：`UPLOAD_GUIDE.md`

---

**版本**: 1.0.0 | **GitHub**: https://github.com/achimigo/mastergo-analyzer
