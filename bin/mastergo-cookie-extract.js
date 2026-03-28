#!/usr/bin/env node
/**
 * MasterGo Cookie 提取器
 *
 * 用途：帮助提取 MasterGo 的 Cookie 用于认证分析
 *
 * 用法：node mastergo-cookie-extract.js
 */

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

async function main() {
  console.log('MasterGo Cookie 提取器\n');
  console.log('请按以下步骤操作:\n');

  console.log('步骤 1: 打开 MasterGo');
  console.log('  - 在浏览器中访问 https://mastergo.com');
  console.log('  - 登录你的账号\n');

  console.log('步骤 2: 打开开发者工具');
  console.log('  - 按 F12 (Windows/Linux) 或 Cmd+Option+I (Mac)');
  console.log('  - 切换到 "Network" (网络) 标签\n');

  console.log('步骤 3: 刷新页面');
  console.log('  - 按 F5 或 Cmd+R 刷新');
  console.log('  - 在左侧请求列表中找到任意一个请求\n');

  console.log('步骤 4: 复制 Cookie');
  console.log('  - 点击该请求');
  console.log('  - 在右侧找到 "Request Headers" (请求头)');
  console.log('  - 找到 "Cookie:" 开头的整行');
  console.log('  - 复制冒号后面的所有内容\n');

  const cookieString = await question('请粘贴 Cookie 内容（不包括 "Cookie: " 前缀）: ');

  if (!cookieString || cookieString.trim().length < 10) {
    console.log('\n[错误] Cookie 内容太短，请检查是否正确复制');
    rl.close();
    process.exit(1);
  }

  // 保存 Cookie
  const saveDir = path.join(process.env.HOME, '.mastergo');
  const cookieFile = path.join(saveDir, 'cookie.txt');

  await fs.mkdir(saveDir, { recursive: true });
  await fs.writeFile(cookieFile, cookieString.trim());

  console.log(`\n[成功] Cookie 已保存到：${cookieFile}`);
  console.log(`\n使用方法:`);
  console.log(`  mastergo-auth --cookie-file ${cookieFile} https://mastergo.com/xxx`);
  console.log(`\n或在分析器中直接使用 Cookie 字符串:`);
  console.log(`  mastergo-auth --cookie "${cookieString.trim().substring(0, 50)}..." <url>`);

  rl.close();
}

main().catch(console.error);
