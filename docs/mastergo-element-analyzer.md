# MasterGo 元素定位分析器

用于精准分析 MasterGo 原型中的**特定组件/元素**，适合根据原型的某个部分对应调整页面功能。

---

## 使用场景

| 场景 | 说明 | 工具选择 |
|------|------|---------|
| 整页设计还原 | 完整页面从零实现 | `mastergo-analyze` |
| **组件级调整** | 修改现有页面的某个组件 | `mastergo-element` |
| 功能迭代 | 根据新原型修改旧功能 | `mastergo-element` |
| Bug 修复 | 样式与原型不一致 | `mastergo-element` |

---

## 快速开始

### 基本用法

```bash
# 分析特定元素
mastergo-element <url> <selector>

# 示例：分析登录按钮
mastergo-element https://mastergo.com/xxx/yyy ".login-btn"

# 示例：分析导航栏
mastergo-element https://mastergo.com/xxx/yyy "#main-nav"

# 示例：分析表单（带输出目录）
mastergo-element https://mastergo.com/xxx/yyy "#contact-form" ./output
```

### 如何获取选择器 (Selector)

**方法 1：MasterGo 开发者工具**
1. 在 MasterGo 中选中目标元素
2. 查看属性面板中的「类名」或「ID」
3. 构建选择器：`.class-name` 或 `#element-id`

**方法 2：浏览器开发者工具**
1. 在浏览器中打开原型链接
2. 右键点击目标元素 → 「检查」
3. 复制 CSS 选择器

**方法 3：使用元素路径**
```
.card > .card-body > h2      # 卡片标题
.form-group input[type=email] # 邮箱输入框
nav ul li a                  # 导航链接
```

---

## 输出文件

| 文件 | 说明 | 用途 |
|------|------|------|
| `element-highlight.png` | 元素截图（带红色高亮） | 快速定位目标 |
| `page-with-highlight.png` | 页面截图（带高亮） | 了解上下文位置 |
| `element-original.png` | 元素截图（原始） | 精确视觉参考 |
| `element-info.json` | 元素详细信息 | 完整规格数据 |
| `element.css` | CSS 代码片段 | 直接使用 |
| `element.tailwind.txt` | Tailwind 类名 | 快速实现 |

---

## 在 Claude Code 中的工作流

### 场景 1：修改现有组件

```bash
# 1. 分析原型中的目标元素
mastergo-element https://mastergo.com/xxx/yyy ".user-card"

# 2. 在 Claude Code 中
```

**提示词：**
```
我刚用 mastergo-element 分析了新的用户卡片设计，数据在 ./mastergo-element-output/

请帮我：
1. 查看 element-highlight.png 了解目标位置
2. 读取 element-info.json 获取详细规格
3. 找到项目中现有的 .user-card 组件
4. 对比差异并生成修改建议
5. 输出修改后的代码
```

### 场景 2：添加新功能

```bash
# 分析新设计的按钮
mastergo-element https://mastergo.com/xxx/yyy ".submit-btn"
```

**提示词：**
```
请在 src/components/ 目录下创建一个新的 SubmitButton 组件，
参考 mastergo-element-output/element-info.json 中的规格。

要求：
- 使用 TypeScript
- 支持 loading 状态
- 精确还原设计稿的样式
```

### 场景 3：修复样式不一致

```bash
# 分析原型中的正确样式
mastergo-element https://mastergo.com/xxx/yyy ".alert-error"
```

**提示词：**
```
对比 mastergo-element-output/element-info.json 和当前代码，
找出样式不一致的地方并修复。

当前代码在 src/components/Alert.tsx
```

---

## element-info.json 格式

```json
{
  "selector": ".submit-btn",
  "tag": "button",
  "id": null,
  "classes": ["submit-btn", "btn-primary"],
  "attributes": {
    "type": "submit",
    "data-testid": "submit-button"
  },
  "bounds": {
    "x": 800,
    "y": 600,
    "width": 120,
    "height": 40
  },
  "styles": {
    "display": "inline-flex",
    "position": "relative",
    "flexDirection": "row",
    "justifyContent": "center",
    "alignItems": "center",
    "gap": "8px",
    "padding": {
      "top": "12px",
      "right": "24px",
      "bottom": "12px",
      "left": "24px"
    },
    "fontSize": "16px",
    "fontWeight": "600",
    "color": "rgb(255, 255, 255)",
    "backgroundColor": "rgb(22, 119, 255)",
    "borderRadius": "8px",
    "boxShadow": "rgb(0 0 0 / 0.1) 0 2px 8px"
  },
  "text": "提交",
  "isInteractive": true,
  "depth": 5,
  "parentTag": "form",
  "childCount": 2
}
```

---

## 高级用法

### 组合使用：整页 + 元素

```bash
# 先分析整页（了解整体布局）
mastergo-analyze https://mastergo.com/xxx/yyy ./full-page

# 再分析特定元素（获取详细规格）
mastergo-element https://mastergo.com/xxx/yyy ".complex-component" ./element
```

### 批量分析多个元素

```bash
#!/bin/bash
URL="https://mastergo.com/xxx/yyy"

# 定义要分析的元素
declare -A ELEMENTS=(
  ["header"]=".main-header"
  ["nav"]="#main-nav"
  ["footer"]=".site-footer"
)

# 批量分析
for name in "${!ELEMENTS[@]}"; do
  selector="${ELEMENTS[$name]}"
  output="./output/$name"
  mastergo-element "$URL" "$selector" "$output"
done
```

### 对比两个版本

```bash
# 分析旧版本
mastergo-element https://mastergo.com/old/xxx ".card" ./old-version

# 分析新版本
mastergo-element https://mastergo.com/new/xxx ".card" ./new-version

# 使用 diff 工具对比 JSON
diff ./old-version/element-info.json ./new-version/element-info.json
```

---

## 常见问题

### Q: 选择器找不到元素怎么办？

**A1:** 检查选择器语法
```bash
# 类名使用 .
mastergo-element <url> ".my-class"

# ID 使用 #
mastergo-element <url> "#my-id"

# 标签名直接使用
mastergo-element <url> "button"
```

**A2:** 尝试更简单的选择器
```bash
# 复杂选择器可能失败
mastergo-element <url> ".card > .body > h2"  # 可能失败

# 简化
mastergo-element <url> "h2"  # 更可靠
```

**A3:** 在浏览器中验证
```javascript
// 浏览器控制台运行
document.querySelector('.your-selector')
// 如果返回 null，说明选择器错误
```

### Q: 如何分析伪元素（:hover, :active）？

**A:** MasterGo 通常将不同状态设计为独立的艺术板：
1. 找到对应状态的艺术板
2. 使用其链接进行分析

或者在浏览器中：
```javascript
// 浏览器开发者工具中强制状态
// 然后运行分析
```

### Q: 输出目录在哪里？

**A:** 默认在当前目录：
- `./mastergo-element-output/` (默认)
- 或你指定的目录：`mastergo-element <url> <selector> ./my-output`

---

## 快捷命令

添加到 `~/.bashrc`：

```bash
alias mastergo-element='/home/code/.claude/bin/mastergo-element'
```

使用：
```bash
mastergo-element <url> <selector>
```

---

## 对比：analyze vs element

| 功能 | mastergo-analyze | mastergo-element |
|------|-----------------|-----------------|
| 分析范围 | 整个页面 | 单个元素 |
| DOM 树 | 完整树（深度 5 层） | 单个元素详情 |
| 截图 | 整页截图 | 元素特写（+高亮） |
| CSS 生成 | 设计令牌 | 完整 CSS+Tailwind |
| 适用场景 | 从零实现整页 | 修改特定组件 |

---

## 推荐的完整工作流

```
1. 需求分析
   ↓
2. 在 MasterGo 中定位目标元素
   ↓
3. 获取选择器（开发者工具）
   ↓
4. 运行 mastergo-element
   ↓
5. 在 Claude Code 中：
   - 查看截图
   - 读取 JSON
   - 找到现有代码
   - 生成修改方案
   ↓
6. 审查并应用修改
```

---

**创建日期**: 2026-03-28
**版本**: 1.0.0
