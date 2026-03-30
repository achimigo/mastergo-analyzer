@echo off
setlocal EnableDelayedExpansion

:: MasterGo Analyzer - Windows 安装脚本
:: 用法：双击运行 install.bat 或在命令行执行

:: 设置 UTF-8 编码
chcp 65001 >nul 2>&1

echo =========================================
echo   MasterGo Analyzer 安装脚本 (Windows)
echo =========================================
echo.

:: 检查 Node.js
echo [INFO] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 未安装
    echo   请下载并安装：https://nodejs.org/
    echo   建议安装 LTS 版本 (v18+)
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v 2^>^&1') do set NODE_VERSION=%%i
echo [INFO] Node.js 已安装：%NODE_VERSION%

:: 检查 npm
echo.
echo [INFO] 检查 npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm 未找到
    echo   Node.js 可能未正确安装
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v 2^>^&1') do set NPM_VERSION=%%i
echo [INFO] npm 已安装：%NPM_VERSION%

:: 获取脚本所在目录
set SCRIPT_DIR=%~dp0
set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%

:: 检查 Playwright
echo.
echo [INFO] 检查 Playwright...
if exist "%SCRIPT_DIR%\node_modules\playwright" (
    echo [INFO] Playwright 已安装 (本地)
) else (
    echo [INFO] 安装 Playwright...
    cd /d "%SCRIPT_DIR%"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Playwright 安装失败
        pause
        exit /b 1
    )
    echo [SUCCESS] Playwright 安装完成
)

:: 检查 Chromium 浏览器
echo.
echo [INFO] 检查 Chromium 浏览器...
set CHROMIUM_DIR=%USERPROFILE%\.cache\ms-playwright
if exist "%CHROMIUM_DIR%" (
    dir /b "%CHROMIUM_DIR%" | findstr /c:"chromium-" >nul 2>nul
    if %errorlevel% equ 0 (
        echo [INFO] Chromium 浏览器已安装
    ) else (
        echo [INFO] 安装 Chromium 浏览器...
        cd /d "%SCRIPT_DIR%"
        call npx playwright install chromium
        if %errorlevel% neq 0 (
            echo [ERROR] Chromium 安装失败
            pause
            exit /b 1
        )
        echo [SUCCESS] Chromium 安装完成
    )
) else (
    echo [INFO] 安装 Chromium 浏览器...
    cd /d "%SCRIPT_DIR%"
    call npx playwright install chromium
    if %errorlevel% neq 0 (
        echo [ERROR] Chromium 安装失败
        pause
        exit /b 1
    )
    echo [SUCCESS] Chromium 安装完成
)

:: 配置环境变量
echo.
echo [INFO] 配置环境变量...

:: 创建配置脚本
set "CONFIG_FILE=%SCRIPT_DIR%\setenv.bat"
echo @echo off > "%CONFIG_FILE%"
echo chcp 65001 >nul >> "%CONFIG_FILE%"
echo set MASTERGO_ANALYZER_PATH=%SCRIPT_DIR% >> "%CONFIG_FILE%"
echo doskey mastergo-analyze=%%MASTERGO_ANALYZER_PATH%%\bin\mastergo-analyze.bat $* >> "%CONFIG_FILE%"
echo doskey mastergo-element=%%MASTERGO_ANALYZER_PATH%%\bin\mastergo-element.bat $* >> "%CONFIG_FILE%"
echo doskey mastergo-auth=%%MASTERGO_ANALYZER_PATH%%\bin\mastergo-auth.bat $* >> "%CONFIG_FILE%"
echo doskey mastergo-cookie=%%MASTERGO_ANALYZER_PATH%%\bin\mastergo-cookie-extract.js $* >> "%CONFIG_FILE%"

echo [SUCCESS] 环境变量脚本已创建：%CONFIG_FILE%

:: 提示用户
echo.
echo =========================================
echo   安装完成!
echo =========================================
echo.
echo 使用方法:
echo.
echo  方法 1 (推荐): 加载环境变量脚本
echo    在当前命令行窗口运行:
echo    call "%CONFIG_FILE%"
echo.
echo  方法 2: 将环境变量添加到系统
echo    1. 右键"此电脑" - 属性
echo    2. 高级系统设置 - 环境变量
echo    3. 新建系统变量:
echo       MASTERGO_ANALYZER_PATH=%SCRIPT_DIR%
echo    4. 编辑 Path 变量，添加:
echo       %%MASTERGO_ANALYZER_PATH%%\bin
echo.
echo  方法 3: 直接运行脚本
echo    "%SCRIPT_DIR%\bin\mastergo-analyze.bat" ^<url^>
echo.
echo 验证安装:
echo   call "%CONFIG_FILE%"
echo   mastergo-analyze --help
echo.

:: 询问是否立即加载环境变量
set /p LOAD_NOW="是否立即加载环境变量？(Y/N): "
if /i "%LOAD_NOW%"=="Y" (
    call "%CONFIG_FILE%"
    echo.
    echo [INFO] 环境变量已加载
    echo [INFO] 现在可以使用 mastergo-analyze 等命令
)

echo.
pause
