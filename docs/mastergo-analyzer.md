# MasterGo 原型分析器

通过无头浏览器自动分析 MasterGo 原型，提取布局、样式、颜色等信息，解决 Claude Code 无法直接看图的问题。

---

## 快速开始

### 1. 安装依赖

```bash
# 安装 Playwright (无头浏览器库)
npm install -g playwright

# 安装 Chromium 浏览器
npx playwright install chromium
```

### 2. 使用方法

```bash
# 基本用法
mastergo-analyze https://mastergo.com/xxx/yyy

# 指定输出目录
mastergo-analyze https://mastergo.com/xxx/yyy ./my-output
```

### 3. 在 Claude Code 中使用

分析完成后，在 Claude Code 中：

```
请读取 mastergo-output/design-tokens.json 获取设计令牌，
然后根据 analysis.json 中的 DOM 结构实现这个页面。
```

---

## 输出文件

| 文件 | 说明 | 用途 |
|------|------|------|
| `screenshot.png` | 完整页面截图 | 快速了解整体布局 |
| `design-tokens.json` | 设计令牌 | 颜色、字体、间距提取 |
| `analysis.json` | 完整分析数据 | DOM 结构 + 计算样式 |

---

## design-tokens.json 格式

```json
{
  "colors": [
    "rgb(51, 51, 51)",
    "rgb(255, 255, 255)",
    "rgb(22, 119, 255)"
  ],
  "fonts": [
    "\"PingFang SC\"",
    "-apple-system, BlinkMacSystemFont"
  ],
  "fontSizes": [
    "12px",
    "14px",
    "16px",
    "20px"
  ],
  "spacing": [
    "4px",
    "8px",
    "12px",
    "16px",
    "24px"
  ]
}
```

---

## analysis.json 格式（节选）

```json
{
  "domTree": {
    "tag": "body",
    "className": null,
    "bounds": { "x": 0, "y": 0, "width": 1920, "height": 3000 },
    "styles": {
      "display": "block",
      "margin": { "top": "0px", "right": "0px", ... },
      "padding": { "top": "0px", ... },
      "fontSize": "16px",
      "color": "rgb(51, 51, 51)",
      "backgroundColor": "rgb(255, 255, 255)"
    },
    "children": [...]
  }
}
```

---

## 在 Claude Code 中的工作流

### 推荐的提示词

```
我已经用 mastergo-analyze 分析了设计稿，请帮我实现这个页面：

1. 先读取 mastergo-output/design-tokens.json，了解设计系统
2. 查看 mastergo-output/screenshot.png 了解整体布局
3. 根据 analysis.json 实现 HTML 结构
4. 使用 Tailwind CSS（或普通 CSS）实现样式

要求：
- 精确还原设计稿的间距和布局
- 使用设计令牌中的颜色和字体
- 响应式设计，适配移动端
```

### 迭代优化

如果第一次实现不够精确，可以：

```
请根据 analysis.json 调整：
- 第 3 行的容器 padding 应该是 24px（当前是 16px）
- 标题的 fontSize 应该是 20px，fontWeight 应该是 600
- 按钮的 backgroundColor 应该是 rgb(22, 119, 255)
```

---

## 高级用法

### 提取特定元素

修改分析器脚本，添加选择器参数：

```bash
# 只分析特定区域（需要修改脚本）
node mastergo-analyzer.js <url> --selector ".main-content"
```

### 批量分析

```bash
# 批量分析多个页面
urls=(
  "https://mastergo.com/xxx/home"
  "https://mastergo.com/xxx/profile"
  "https://mastergo.com/xxx/settings"
)

for url in "${urls[@]}"; do
  mastergo-analyze "$url" "./output/$(basename $url)"
done
```

### 与 Visual Companion 配合

如果你启用了 Claude Code 的 Visual Companion：

1. 先用分析器生成截图和分析数据
2. 在 Visual Companion 中打开 `screenshot.png`
3. 结合 analysis.json 数据进行可视化讲解

---

## 限制与注意事项

### MasterGo 登录保护

如果原型需要登录才能访问：

**方案 A**：使用公开分享链接
- 在 MasterGo 中生成「公开可查看」的分享链接
- 确保链接不需要登录

**方案 B**：使用带认证的浏览器
- 需要先手动登录一次
- 使用 `--save-storage` 保存认证状态

### 动态内容

某些 MasterGo 原型使用懒加载：

```bash
# 增加等待时间
node mastergo-analyzer.js <url> --wait-time 5000
```

### 复杂交互

悬停、展开等状态无法自动捕获，需要：
1. 在 MasterGo 中创建单独的艺术板
2. 或使用浏览器开发者工具手动修改状态后截图

---

## 故障排除

### 问题：浏览器无法启动

```bash
# 重新安装浏览器
npx playwright install chromium --force

# 检查依赖
npx playwright install-deps
```

### 问题：页面加载超时

```bash
# 增加超时时间（修改脚本中的 CONFIG）
timeout: 60000  # 60 秒
```

### 问题：输出数据不完整

可能是页面未完全渲染，尝试：
1. 增加 `waitForTimeout` 时间
2. 添加特定元素的等待条件

---

## 技术原理

### 数据提取流程

```
Playwright (Chromium)
    ↓
访问 MasterGo 原型 URL
    ↓
等待网络空闲 + 内容渲染
    ↓
JavaScript 遍历 DOM 树
    ↓
对每个元素调用：
  - getBoundingClientRect() → 位置/尺寸
  - window.getComputedStyle() → 所有样式
    ↓
序列化为 JSON
    ↓
输出文件
```

### 为什么有效

1. **使用真实浏览器** - 与设计稿在浏览器中的渲染一致
2. **计算样式** - 获取的是最终计算值，不是 CSS 变量
3. **完整 DOM 树** - 包含所有嵌套关系和层级

---

## 替代方案对比

| 方案 | 精度 | 速度 | 复杂度 | 推荐场景 |
|------|------|------|--------|---------|
| **本工具** | 高 | 中 | 低 | 通用 |
| MasterGo API | 最高 | 快 | 中 | 企业版用户 |
| 手动标注 | 高 | 慢 | 低 | 小页面 |
| 视觉 AI 分析 | 中 | 快 | 低 | 快速原型 |

---

## 快捷命令

添加到 `~/.bashrc`：

```bash
alias mastergo-analyze='/home/code/.claude/bin/mastergo-analyze'
```

使用：
```bash
mastergo-analyze <url>
```

---

**创建日期**: 2026-03-28
**版本**: 1.0.0
