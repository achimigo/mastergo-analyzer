@echo off
chcp 65001 >nul

:: MasterGo Cookie 提取工具
:: 用法：mastergo-cookie

node "%~dp0\mastergo-cookie-extract.js" %*
