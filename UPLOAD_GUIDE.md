# MasterGo Analyzer 上传到 GitHub 指南

## 快速上传（推荐）

### 使用自动上传脚本

```bash
cd /home/code/.claude/skills/mastergo-analyzer

# 运行上传脚本
./upload-to-github.sh
```

脚本会自动：
1. 初始化 git 仓库
2. 添加所有文件
3. 创建初始提交
4. 引导创建 GitHub 仓库
5. 推送代码

---

## 手动上传

### 步骤 1：准备仓库

```bash
cd /home/code/.claude/skills/mastergo-analyzer

# 初始化 git（如果还没有）
git init

# 添加所有文件
git add -A

# 创建提交
git commit -m "Initial commit: MasterGo Analyzer v1.0.0"

# 创建 main 分支
git branch -M main
```

### 步骤 2：在 GitHub 创建仓库

**方式 A：使用 GitHub CLI**

```bash
# 创建并推送
gh repo create mastergo-analyzer --public --source=. --remote=origin --push
```

**方式 B：使用网页**

1. 访问 https://github.com/new
2. 填写仓库信息：
   - 仓库名：`mastergo-analyzer`
   - 可见性：Public
   - **不要**勾选「添加 README」
3. 点击「Create repository」
4. 复制显示的 remote 地址

### 步骤 3：推送代码

```bash
# 添加 remote（替换为你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/mastergo-analyzer.git

# 推送
git push -u origin main
```

---

## 上传后配置

### 1. 更新仓库链接

编辑以下文件，替换 `YOUR_USERNAME`：

**README.md**:
```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

**package.json**:
```json
"repository": {
  "type": "git",
  "url": "https://github.com/YOUR_USERNAME/mastergo-analyzer.git"
}
```

### 2. 添加主题标签

在 GitHub 仓库页面：
1. 点击右上角⚙️ (设置图标)
2. 添加标签：`mastergo` `design-tool` `frontend` `playwright` `claude-code`

### 3. 更新 git 用户信息

```bash
# 配置用户信息
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

---

## 故障排除

### 问题：git push 失败（权限）

**解决方案 A：使用 HTTPS**
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/mastergo-analyzer.git
git push -u origin main
```

**解决方案 B：使用 SSH**
```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 添加公钥到 GitHub
# https://github.com/settings/keys

# 使用 SSH remote
git remote set-url origin git@github.com:YOUR_USERNAME/mastergo-analyzer.git
git push -u origin main
```

### 问题：README 冲突

如果 GitHub 提示 README 冲突（因为你本地已有 README）：

```bash
# 拉取远程 README
git pull origin main --allow-unrelated-histories

# 解决冲突（如果需要）
# 然后提交
git commit -m "Merge remote README"

# 推送
git push -u origin main
```

### 问题：文件太大

如果某些文件太大（>100MB）：

```bash
# 检查大文件
find . -type f -size +50M

# 在 .gitignore 中添加
echo "mastergo-output/" >> .gitignore
echo "*.log" >> .gitignore

# 重新添加
git rm --cached -r mastergo-output/
git commit -m "Remove large output files"
git push
```

---

## 完整命令速查

```bash
# 1. 进入目录
cd /home/code/.claude/skills/mastergo-analyzer

# 2. 初始化 git
git init

# 3. 添加文件
git add -A

# 4. 提交
git commit -m "Initial commit"

# 5. 设置分支
git branch -M main

# 6. 添加 remote（替换为你的地址）
git remote add origin https://github.com/YOUR_USERNAME/mastergo-analyzer.git

# 7. 推送
git push -u origin main
```

---

## 验证上传

上传完成后，访问你的仓库：

```
https://github.com/YOUR_USERNAME/mastergo-analyzer
```

确认以下文件存在：
- [ ] README.md
- [ ] LICENSE
- [ ] package.json
- [ ] src/ 目录
- [ ] bin/ 目录
- [ ] docs/ 目录

---

## 后续步骤

1. 在 GitHub 上启用 Issues
2. 考虑添加 GitHub Actions 进行 CI/CD
3. 添加 release 标签
4. 在 README 中添加 GitHub Actions 状态徽章

---

**需要帮助？**

- GitHub 文档：https://docs.github.com/
- Git 手册：https://git-scm.com/doc
