@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: MasterGo 认证分析器
:: 用法：mastergo-auth [选项] <url>

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "BASE_DIR=%SCRIPT_DIR%\.."

:: 检查依赖
call "%BASE_DIR%\common\check-dependencies.bat" || (
    echo [ERROR] 依赖检查失败
    exit /b 1
)

:: 运行分析器
echo [INFO] 启动 MasterGo 认证分析器...
node "%SCRIPT_DIR%\mastergo-auth.js" %*
