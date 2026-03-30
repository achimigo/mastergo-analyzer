@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: MasterGo 元素分析器
:: 用法：mastergo-element <url> <selector> [output-dir]

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
set "OUTPUT_DIR=%~3"
if "%OUTPUT_DIR%"=="" set "OUTPUT_DIR=.\mastergo-element-output"

:: 运行分析器
if "%~2"=="" (
    echo [ERROR] 缺少参数
    echo 用法：mastergo-element ^<url^> ^<selector^> [output-dir]
    exit /b 1
)

echo [INFO] 启动 MasterGo 元素分析器...
node "%SCRIPT_DIR%\mastergo-element.js" %1 %2 "%OUTPUT_DIR%"
