# MasterGo Analyzer

> 将 MasterGo 设计原型自动转换为前端代码的分析工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)

通过无头浏览器（Playwright）自动分析 MasterGo 设计原型，提取设计令牌、布局结构和样式信息，解决 AI 编程助手无法直接看图的问题。

## ✨ 功能特性

- 🔍 **整页分析** - 完整页面从零实现
- 🎯 **元素分析** - 精准分析特定组件
- 🔐 **认证支持** - Cookie/配置文件登录
- 🎨 **设计令牌** - 自动提取颜色/字体/间距
- 💻 **代码生成** - CSS 和 Tailwind 代码片段
- 🖼️ **截图标注** - 高亮显示目标元素

## 📦 安装

### 1. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/mastergo-analyzer.git
cd mastergo-analyzer
```

### 2. 安装依赖

```bash
npm install
npx playwright install chromium
```

### 3. 配置快捷命令

```bash
# 添加到 ~/.bashrc
echo 'export MASTERGO_ANALYZER_PATH="~/mastergo-analyzer"' >> ~/.bashrc
echo 'alias mastergo-analyze="node $MASTERGO_ANALYZER_PATH/src/analyzer.js"' >> ~/.bashrc
echo 'alias mastergo-element="node $MASTERGO_ANALYZER_PATH/src/element.js"' >> ~/.bashrc
echo 'alias mastergo-auth="node $MASTERGO_ANALYZER_PATH/src/auth.js"' >> ~/.bashrc

# 加载配置
source ~/.bashrc
```

## 🚀 快速开始

### 分析整页设计

```bash
mastergo-analyze https://mastergo.com/xxx/yyy
```

### 分析特定组件

```bash
mastergo-element https://mastergo.com/xxx/yyy ".submit-btn"
```

### 需要登录的页面

```bash
# 使用配置文件（推荐）
mastergo-auth --profile ~/.mastergo/profile https://mastergo.com/xxx

# 使用 Cookie
mastergo-auth --cookie-file ~/.mastergo/cookie.txt https://mastergo.com/xxx
```

## 📖 使用文档

### Claude Code Skill 使用

在 Claude Code 中直接使用以下命令：

```
/mastergo <url>                    # 整页分析
/mastergo-element <url> <selector> # 元素分析
/mastergo-auth [选项] <url>        # 认证分析
/mastergo-cookie                   # Cookie 提取
```

### 输出文件

**整页分析：**
```
mastergo-output/
├── screenshot.png         # 页面截图
├── analysis.json          # DOM + 样式
└── design-tokens.json     # 设计令牌
```

**元素分析：**
```
mastergo-element-output/
├── element-highlight.png  # 高亮截图
├── element-original.png   # 原始截图
├── element-info.json      # 元素信息
├── element.css            # CSS 代码
└── element.tailwind.txt   # Tailwind 类名
```

## 💡 使用示例

### 从零实现整页

```bash
# 1. 分析设计稿
mastergo-analyze https://mastergo.com/xxx/yyy

# 2. 在 Claude Code 中实现
# "请根据 mastergo-output/ 实现这个页面"
```

### 修改现有组件

```bash
# 1. 分析组件
mastergo-element https://mastergo.com/xxx/yyy ".user-card"

# 2. 在 Claude Code 中修改
# "请根据 element-info.json 调整 UserCard 组件"
```

## 🔧 命令行选项

### mastergo-analyze

```bash
mastergo-analyze <url> [output-dir]

# 示例
mastergo-analyze https://mastergo.com/xxx ./output
```

### mastergo-element

```bash
mastergo-element <url> <selector> [output-dir]

# 选择器示例
mastergo-element https://mastergo.com/xxx ".button-primary"
mastergo-element https://mastergo.com/xxx "#header-nav"
mastergo-element https://mastergo.com/xxx ".card > h2"
```

### mastergo-auth

```bash
mastergo-auth [选项] <url>

选项:
  --cookie "<string>"      Cookie 字符串
  --cookie-file <path>     Cookie 文件路径
  --profile <path>         浏览器配置文件
  --output <dir>           输出目录
  --interactive            交互模式
```

## 🔐 认证方案

| 方案 | 适用场景 | 命令 |
|------|---------|------|
| 公开分享链接 | 有分享权限 | `mastergo-analyze <share-url>` |
| Cookie 文件 | 临时使用 | `mastergo-auth --cookie-file` |
| 配置文件 | 长期使用 | `mastergo-auth --profile` |

详见：[认证指南](docs/AUTH_GUIDE.md)

## 📚 文档

- [使用指南](docs/USAGE.md)
- [认证指南](docs/AUTH_GUIDE.md)
- [元素分析器](docs/ELEMENT_ANALYZER.md)
- [FAQ](docs/FAQ.md)

## 🛠️ 开发

### 项目结构

```
mastergo-analyzer/
├── src/
│   ├── analyzer.js       # 整页分析器
│   ├── element.js        # 元素分析器
│   └── auth.js           # 认证分析器
├── bin/                  # 快捷命令
├── docs/                 # 文档
├── skills/               # Claude Code Skill
└── package.json
```

### 本地测试

```bash
# 运行分析
node src/analyzer.js <test-url>

# 运行元素分析
node src/element.js <test-url> ".test-selector"
```

## 🤝 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 更新日志

### v1.0.0 (2026-03-28)

- ✨ 初始版本发布
- 🔍 整页分析功能
- 🎯 元素分析功能
- 🔐 Cookie/配置文件认证
- 💻 CSS/Tailwind代码生成

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [Claude Code](https://github.com/anthropics/claude-code)
- [Playwright](https://playwright.dev/)
- [MasterGo](https://mastergo.com/)
- [ Ruflo](https://github.com/ruvnet/claude-flow)

## 👥 作者

- Created by RuFlo Team
- GitHub: [@ruvnet](https://github.com/ruvnet)

---

<p align="center">Made with ❤️ by RuFlo Team</p>
