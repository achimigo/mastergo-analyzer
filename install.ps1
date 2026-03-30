# MasterGo Analyzer - PowerShell 安装脚本
# 用法：.\install.ps1 或在 PowerShell 中运行

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  MasterGo Analyzer 安装脚本 (PowerShell)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "[INFO] 检查 Node.js..." -ForegroundColor Blue
try {
    $nodeVersion = node -v 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "[INFO] Node.js 已安装：$nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js 未安装" -ForegroundColor Red
    Write-Host "  请下载并安装：https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "  建议安装 LTS 版本 (v18+)" -ForegroundColor Yellow
    pause
    exit 1
}

# 获取脚本所在目录
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 检查 Playwright
Write-Host ""
Write-Host "[INFO] 检查 Playwright..." -ForegroundColor Blue
$playwrightPath = Join-Path $scriptDir "node_modules\playwright"
if (Test-Path $playwrightPath) {
    Write-Host "[INFO] Playwright 已安装 (本地)" -ForegroundColor Green
} else {
    Write-Host "[INFO] 安装 Playwright..." -ForegroundColor Yellow
    Set-Location $scriptDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Playwright 安装失败" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "[SUCCESS] Playwright 安装完成" -ForegroundColor Green
}

# 检查 Chromium 浏览器
Write-Host ""
Write-Host "[INFO] 检查 Chromium 浏览器..." -ForegroundColor Blue
$chromiumDir = Join-Path $env:USERPROFILE ".cache\ms-playwright"
if (Test-Path $chromiumDir) {
    $chromiumExists = Get-ChildItem $chromiumDir -Directory -Filter "chromium-*" -ErrorAction SilentlyContinue
    if ($chromiumExists) {
        Write-Host "[INFO] Chromium 浏览器已安装" -ForegroundColor Green
    } else {
        Write-Host "[INFO] 安装 Chromium 浏览器..." -ForegroundColor Yellow
        Set-Location $scriptDir
        npx playwright install chromium
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Chromium 安装失败" -ForegroundColor Red
            pause
            exit 1
        }
        Write-Host "[SUCCESS] Chromium 安装完成" -ForegroundColor Green
    }
} else {
    Write-Host "[INFO] 安装 Chromium 浏览器..." -ForegroundColor Yellow
    Set-Location $scriptDir
    npx playwright install chromium
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Chromium 安装失败" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "[SUCCESS] Chromium 安装完成" -ForegroundColor Green
}

# 配置环境变量
Write-Host ""
Write-Host "[INFO] 配置环境变量..." -ForegroundColor Blue

# 创建配置脚本
$configFile = Join-Path $scriptDir "setenv.ps1"
@"
`$env:MASTERGO_ANALYZER_PATH = "$scriptDir"
function mastergo-analyze { & "$scriptDir\bin\mastergo-analyze.bat" `$args }
function mastergo-element { & "$scriptDir\bin\mastergo-element.bat" `$args }
function mastergo-auth { & "$scriptDir\bin\mastergo-auth.bat" `$args }
function mastergo-cookie { & "$scriptDir\bin\mastergo-cookie.bat" `$args }
"@ | Out-File -FilePath $configFile -Encoding UTF8

Write-Host "[SUCCESS] PowerShell 配置脚本已创建：$configFile" -ForegroundColor Green

# 提示用户
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  安装完成!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "使用方法:" -ForegroundColor Yellow
Write-Host ""
Write-Host " 方法 1 (推荐): 加载配置脚本" -ForegroundColor White
Write-Host "   在当前 PowerShell 窗口运行:" -ForegroundColor Gray
Write-Host "   . \$configFile" -ForegroundColor Cyan
Write-Host ""
Write-Host " 方法 2: 添加到 PowerShell 配置文件" -ForegroundColor White
Write-Host "   将以下内容添加到 `$PROFILE:" -ForegroundColor Gray
Write-Host "   . '$configFile'" -ForegroundColor Cyan
Write-Host ""
Write-Host " 方法 3: 直接运行脚本" -ForegroundColor White
Write-Host "   & '$scriptDir\bin\mastergo-analyze.bat' <url>" -ForegroundColor Cyan
Write-Host ""
Write-Host "验证安装:" -ForegroundColor Yellow
Write-Host "   . '$configFile'" -ForegroundColor Cyan
Write-Host "   mastergo-analyze --help" -ForegroundColor Cyan
Write-Host ""

# 询问是否立即加载配置
$loadNow = Read-Host "是否立即加载环境变量？(Y/N)"
if ($loadNow -eq "Y" -or $loadNow -eq "y") {
    . $configFile
    Write-Host ""
    Write-Host "[INFO] 环境变量已加载" -ForegroundColor Green
    Write-Host "[INFO] 现在可以使用 mastergo-analyze 等命令" -ForegroundColor Green
}

Write-Host ""
pause
