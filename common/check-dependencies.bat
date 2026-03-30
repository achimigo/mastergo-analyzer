@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: MasterGo 依赖检查库 (Windows)
:: 用法：call check-dependencies.bat

:: 颜色输出函数
:print_status
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

:print_tip
echo [TIP] %~1
goto :eof

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "BASE_DIR=%SCRIPT_DIR%.."

:: 检查 Node.js
:check_node
where node >nul 2>nul
if %errorlevel% neq 0 (
    call :print_error "Node.js 未安装，请先安装 Node.js (v18+)"
    echo   下载地址：https://nodejs.org/
    exit /b 1
)

for /f "tokens=2 delims=v" %%i in ('node -v 2^>^&1') do set "NODE_MAJOR=%%i"
for /f "tokens=1 delims=." %%j in ('echo !NODE_MAJOR!') do set "NODE_VERSION=%%j"

if !NODE_VERSION! LSS 18 (
    call :print_error "Node.js 版本过低 (当前：v!NODE_MAJOR!), 需要 v18+"
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set "NODE_VER=%%i"
call :print_status "Node.js 已安装：!NODE_VER!"
goto :check_playwright

:: 检查 Playwright
:check_playwright
if exist "%SCRIPT_DIR%..\node_modules\playwright" (
    call :print_status "Playwright 已安装 (本地)"
    goto :check_chromium
)

where npm >nul 2>nul
if %errorlevel% equ 0 (
    call npm list -g playwright >nul 2>nul
    if %errorlevel% equ 0 (
        call :print_status "Playwright 已安装 (全局)"
        goto :check_chromium
    )
)

call :install_playwright
goto :check_chromium

:: 安装 Playwright
:install_playwright
call :print_status "安装 Playwright..."
cd /d "%SCRIPT_DIR%.."
call npm install
if %errorlevel% neq 0 (
    call :print_error "Playwright 安装失败"
    exit /b 1
)
cd /d "%SCRIPT_DIR%"
call :print_success "Playwright 安装完成"
goto :eof

:: 检查 Chromium
:check_chromium
set "CHROMIUM_DIR=%USERPROFILE%\.cache\ms-playwright"
if exist "%CHROMIUM_DIR%" (
    dir /b "%CHROMIUM_DIR%" | findstr /c:"chromium-" >nul 2>nul
    if %errorlevel% equ 0 (
        call :print_status "Chromium 浏览器已安装"
        goto :eof
    )
)

call :install_chromium
goto :eof

:: 安装 Chromium
:install_chromium
call :print_status "安装 Chromium 浏览器..."
cd /d "%SCRIPT_DIR%.."
call npx playwright install chromium
if %errorlevel% neq 0 (
    call :print_error "Chromium 安装失败"
    exit /b 1
)
cd /d "%SCRIPT_DIR%"
call :print_success "Chromium 安装完成"
goto :eof

:: 主检查函数
:main
echo.
call :print_status "检查依赖..."
call :check_node
call :check_playwright
call :check_chromium
echo.
call :print_success "依赖检查完成"
exit /b 0

:: 如果直接运行此脚本则执行主函数
if "%~0"=="%~nx0" call :main
