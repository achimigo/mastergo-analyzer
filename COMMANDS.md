# MasterGo 分析器命令

## 整页分析

**命令**: `/mastergo <url> [output-dir]`

分析整个页面，适合从零实现完整页面。

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `<url>` | 是 | MasterGo 原型链接 |
| `[output-dir]` | 否 | 输出目录（默认：./mastergo-output） |

### 示例

```bash
/mastergo https://mastergo.com/xxx/yyy
/mastergo https://mastergo.com/xxx/yyy ./my-output
```

### 输出

- `screenshot.png` - 完整页面截图
- `design-tokens.json` - 设计令牌（颜色/字体/间距）
- `analysis.json` - 完整 DOM 结构和样式

---

## 元素分析

**命令**: `/mastergo-element <url> <selector> [output-dir]`

分析特定组件，适合修改现有页面的某个部分。

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `<url>` | 是 | MasterGo 原型链接 |
| `<selector>` | 是 | CSS 选择器（如：`.button`, `#header`） |
| `[output-dir]` | 否 | 输出目录（默认：./mastergo-element-output） |

### 示例

```bash
/mastergo-element https://mastergo.com/xxx/yyy ".submit-btn"
/mastergo-element https://mastergo.com/xxx/yyy "#contact-form" ./output
```

### 如何获取选择器

1. 在 MasterGo 中查看元素的类名或 ID
2. 或在浏览器开发者工具中复制选择器

### 输出

- `element-highlight.png` - 带高亮的元素截图
- `element-original.png` - 原始元素截图
- `element-info.json` - 元素详细信息
- `element.css` - CSS 代码片段
- `element.tailwind.txt` - Tailwind 类名

---

## 认证分析

**命令**: `/mastergo-auth [选项] <url>`

用于需要登录的 MasterGo 页面。

### 选项

| 选项 | 说明 |
|------|------|
| `--cookie "<string>"` | Cookie 字符串 |
| `--cookie-file <path>` | Cookie 文件路径 |
| `--profile <path>` | 浏览器配置文件目录 |
| `--output <dir>` | 输出目录 |
| `--interactive` | 交互模式 |

### 示例

```bash
# 使用 Cookie
/mastergo-auth --cookie "token=xxx; session=yyy" <url>

# 使用 Cookie 文件
/mastergo-auth --cookie-file ~/.mastergo/cookie.txt <url>

# 使用配置文件（推荐）
/mastergo-auth --profile ~/.mastergo/profile <url>

# 交互模式
/mastergo-auth --interactive
```

---

## Cookie 提取

**命令**: `/mastergo-cookie`

交互式提取并保存 MasterGo Cookie。

### 使用步骤

1. 运行 `/mastergo-cookie`
2. 按提示在浏览器中登录 MasterGo
3. 复制 Cookie 并粘贴
4. Cookie 自动保存到 `~/.mastergo/cookie.txt`

---

## 完整工作流示例

### 场景 1：从零实现整页

```
/mastergo https://mastergo.com/xxx/yyy

请根据 mastergo-output/ 实现这个页面：
- 使用 React + Tailwind CSS
- 响应式设计
- 精确还原设计稿
```

### 场景 2：修改现有组件

```
/mastergo-element https://mastergo.com/xxx/yyy ".user-card"

请找到 src/components/UserCard.tsx，
根据 element-info.json 调整样式和布局。
```

### 场景 3：需要登录的设计

```
/mastergo-cookie
（按提示操作保存 Cookie）

/mastergo-auth --cookie-file ~/.mastergo/cookie.txt https://mastergo.com/xxx

请实现这个页面...
```

### 场景 4：长期使用配置

```
# 首次使用（创建配置文件）
/mastergo-auth --profile ~/.mastergo/profile

# 之后直接使用
/mastergo --profile ~/.mastergo/profile <url>
/mastergo-element --profile ~/.mastergo/profile <url> ".component"
```

---

## 提示词模板

### 整页实现

```
根据 <output-dir>/ 中的数据实现这个页面：

1. 查看 screenshot.png 了解整体布局
2. 读取 design-tokens.json 获取设计系统
3. 根据 analysis.json 实现 HTML 结构

技术栈：<React/Vue/原生>
要求：
- 响应式设计
- 精确还原间距和颜色
- 组件化拆分
```

### 组件修改

```
对比 <output-dir>/element-info.json 和当前代码：

1. 找出样式差异
2. 生成修改方案
3. 应用修改

当前组件：<文件路径>
```

### 新建组件

```
根据 <output-dir>/element-info.json 创建新组件：

组件名：<ComponentName>
位置：<文件路径>
要求：
- TypeScript
- 支持 props
- 精确还原设计稿
```

---

## 故障排除

| 问题 | 解决方案 |
|------|---------|
| 命令找不到 | `source ~/.bashrc` |
| 依赖未安装 | 运行任意命令会自动安装 |
| 元素找不到 | 检查选择器是否正确 |
| 需要登录 | 使用 `/mastergo-auth` 或分享链接 |

---

## 相关文档

- 完整认证指南：`~/.claude/docs/mastergo-auth-guide.md`
- 元素分析器文档：`~/.claude/docs/mastergo-element-analyzer.md`
- 分析器文档：`~/.claude/docs/mastergo-analyzer.md`
