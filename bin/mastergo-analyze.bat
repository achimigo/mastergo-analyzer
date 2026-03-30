@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: MasterGo 分析器 - 整页设计分析
:: 用法：mastergo-analyze <url> [output-dir]

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "BASE_DIR=%SCRIPT_DIR%\.."

:: 检查依赖
call "%BASE_DIR%\common\check-dependencies.bat" || (
    echo [ERROR] 依赖检查失败
    exit /b 1
)

:: 设置默认输出目录
set "OUTPUT_DIR=%~2"
if "%OUTPUT_DIR%"=="" set "OUTPUT_DIR=.\mastergo-output"

:: 运行分析器
echo [INFO] 启动 MasterGo 分析器...
node "%SCRIPT_DIR%\mastergo-analyzer.js" %1 "%OUTPUT_DIR%"
