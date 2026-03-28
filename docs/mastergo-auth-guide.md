# MasterGo 登录认证解决方案

解决 MasterGo 原型需要登录才能访问的问题。

---

## 问题说明

MasterGo 的设计文件通常需要登录才能查看，这导致无头浏览器无法直接访问和分析。

---

## 解决方案总览

| 方案 | 适用场景 | 稳定性 | 推荐度 |
|------|---------|--------|--------|
| 公开分享链接 | 有分享权限 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Cookie 认证 | 个人使用 | ⭐⭐ | ⭐⭐⭐⭐ |
| 浏览器配置文件 | 长期使用 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| MasterGo API | 企业版 | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 方案 1：公开分享链接（最推荐）

### 适用场景
- 你是设计文件的所有者或有分享权限
- 团队内部协作
- 不介意生成公开链接

### 操作步骤

1. **在 MasterGo 中生成分享链接**
   ```
   MasterGo → 打开设计文件 → 点击右上角「分享」
   → 设置「任何人可查看」→ 复制链接
   ```

2. **使用分享链接进行分析**
   ```bash
   mastergo-analyze https://mastergo.com/share/xxx
   mastergo-element https://mastergo.com/share/xxx ".component"
   ```

### 优点
- ✅ 无需认证，最稳定
- ✅ 链接长期有效
- ✅ 支持所有分析功能

### 注意事项
- ⚠️ 公开链接可能被任何人访问
- ⚠️ 敏感设计建议使用其他方案

---

## 方案 2：Cookie 认证

### 适用场景
- 个人项目
- 无法生成分享链接
- 临时使用

### 方法 A：使用 Cookie 提取工具（推荐）

```bash
# 1. 运行 Cookie 提取工具
mastergo-cookie

# 2. 按提示操作，复制 Cookie

# 3. 使用 Cookie 进行分析
mastergo-auth --cookie-file ~/.mastergo/cookie.txt https://mastergo.com/xxx
```

### 方法 B：手动获取 Cookie

**步骤 1：在浏览器中获取 Cookie**

1. 打开浏览器，访问 https://mastergo.com
2. 登录账号
3. 打开要分析的设计文件
4. 按 `F12` 打开开发者工具
5. 切换到 **Network** 标签
6. 刷新页面（`F5`）
7. 点击左侧任意一个请求
8. 在右侧找到 **Request Headers**
9. 复制 `Cookie:` 后面的全部内容

**步骤 2：使用 Cookie**

```bash
# 方式 1：直接使用 Cookie 字符串
mastergo-auth --cookie "token=xxx; session=yyy; ..." https://mastergo.com/xxx

# 方式 2：保存到文件后使用
echo "token=xxx; session=yyy; ..." > ~/.mastergo/cookie.txt
mastergo-auth --cookie-file ~/.mastergo/cookie.txt https://mastergo.com/xxx
```

### Cookie 有效期

| Cookie 类型 | 有效期 | 说明 |
|------------|--------|------|
| Session Cookie | 会话期间 | 关闭浏览器失效 |
| Persistent Cookie | 7-30 天 | 有明确过期时间 |

### 注意事项
- ⚠️ Cookie 过期后需要重新获取
- ⚠️ 不要分享你的 Cookie（包含登录凭证）
- ⚠️ 修改 MasterGo 密码后 Cookie 失效

---

## 方案 3：浏览器配置文件（长期使用推荐）

### 适用场景
- 长期使用
- 频繁分析 MasterGo 原型
- 不想每次获取 Cookie

### 使用方法

```bash
# 第一次使用（会打开浏览器登录）
mastergo-auth --profile ~/.mastergo/profile https://mastergo.com

# 按提示在打开的浏览器中登录 MasterGo
# 登录完成后按 Ctrl+C

# 之后使用（自动使用保存的登录状态）
mastergo-auth --profile ~/.mastergo/profile https://mastergo.com/xxx
mastergo-analyze --profile ~/.mastergo/profile https://mastergo.com/xxx
```

### 工作原理

1. 首次运行时，会打开一个可见的浏览器窗口
2. 在浏览器中登录 MasterGo
3. 登录状态保存到配置文件目录
4. 后续使用自动加载登录状态

### 优点
- ✅ 一次登录，长期使用
- ✅ 无需手动管理 Cookie
- ✅ 支持多账号（不同配置文件）

### 配置文件位置

```
~/.mastergo/profile/
├── cookies       # Cookie 数据
├── Local Storage # 本地存储
└── ...           # 其他浏览器数据
```

---

## 方案 4：MasterGo API（企业版）

### 适用场景
- 企业版用户
- 需要自动化工作流
- 团队协作

### 获取 API 访问

1. 联系 MasterGo 企业客服
2. 开通 API 访问权限
3. 获取 API Token

### 使用 API Token

```bash
# 通过 Header 传递 Token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.mastergo.com/v1/files/xxx

# 配合分析器使用（需要扩展脚本）
MASTERGO_TOKEN=xxx node mastergo-api-analyzer.js
```

---

## 工具命令速查

| 命令 | 功能 | 示例 |
|------|------|------|
| `mastergo-cookie` | Cookie 提取工具 | `mastergo-cookie` |
| `mastergo-auth` | 认证分析器 | `mastergo-auth --cookie "xxx" <url>` |
| `mastergo-analyze` | 整页分析 | `mastergo-analyze <url>` |
| `mastergo-element` | 元素分析 | `mastergo-element <url> ".component"` |

---

## 故障排除

### 问题 1：提示需要登录

**症状**：运行分析后输出登录页面

**解决方案**：
```bash
# 使用 Cookie 认证
mastergo-auth --cookie-file ~/.mastergo/cookie.txt <url>

# 或使用配置文件
mastergo-auth --profile ~/.mastergo/profile <url>
```

### 问题 2：Cookie 过期

**症状**：之前能用的 Cookie 突然失效

**解决方案**：
```bash
# 重新获取 Cookie
mastergo-cookie

# 或使用配置文件（自动处理过期）
mastergo-auth --profile ~/.mastergo/profile <url>
```

### 问题 3：配置文件损坏

**症状**：使用配置文件仍然显示登录页

**解决方案**：
```bash
# 删除旧配置，重新创建
rm -rf ~/.mastergo/profile
mastergo-auth --profile ~/.mastergo/profile <url>
```

### 问题 4：分享链接无法访问

**症状**：分享链接返回 404 或无权限

**解决方案**：
1. 检查分享链接是否正确
2. 确认分享权限是「任何人可查看」
3. 尝试重新生成分享链接

---

## 安全建议

### Cookie 安全

1. **不要分享 Cookie**
   - Cookie 包含登录凭证
   - 相当于你的账号密码

2. **定期更新 Cookie**
   - 建议每 7 天更新一次
   - 离职员工离职后立即更新

3. **使用配置文件更安全**
   - Cookie 存储在本地
   - 不通过命令行传递

### 分享链接安全

1. **设置访问权限**
   - 仅「可查看」，不要「可编辑」
   - 敏感设计设置密码保护

2. **定期审查分享链接**
   - 定期检查哪些设计是公开的
   - 关闭不再需要的分享

3. **使用内部协作**
   - 团队成员使用企业账号访问
   - 避免公开分享

---

## 完整工作流示例

### 场景：分析企业内部的 MasterGo 设计

```bash
# 1. 首次设置（一次性）
mastergo-cookie
# → 按提示获取并保存 Cookie

# 2. 分析整页设计
mastergo-auth --cookie-file ~/.mastergo/cookie.txt \
  https://mastergo.com/internal/xxx

# 3. 分析特定组件
mastergo-element \
  --cookie-file ~/.mastergo/cookie.txt \
  https://mastergo.com/internal/xxx ".user-card"

# 4. 在 Claude Code 中实现
# → 读取输出的 JSON 和截图
# → 生成代码
```

### 场景：长期使用（推荐配置）

```bash
# 1. 创建配置文件（一次性）
mastergo-auth --profile ~/.mastergo/profile

# 2. 之后每次直接使用
mastergo-analyze --profile ~/.mastergo/profile <url>
mastergo-element --profile ~/.mastergo/profile <url> ".component"
```

---

## 环境变量配置（可选）

在 `~/.bashrc` 中添加：

```bash
# MasterGo 默认配置文件
export MASTERGO_PROFILE=~/.mastergo/profile

# MasterGo 默认 Cookie 文件
export MASTERGO_COOKIE_FILE=~/.mastergo/cookie.txt
```

然后修改别名：

```bash
alias mastergo-auth='mastergo-auth --profile $MASTERGO_PROFILE'
alias mastergo-analyze='mastergo-analyze --profile $MASTERGO_PROFILE'
```

---

## 附录：Cookie 格式示例

```
# cookie.txt 内容示例
token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;
session=abc123def456...;
user_id=12345;
```

---

**创建日期**: 2026-03-28
**版本**: 1.0.0
