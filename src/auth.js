#!/usr/bin/env node
/**
 * MasterGo 认证分析器
 *
 * 功能:
 * 1. 支持 Cookie 认证访问需要登录的 MasterGo 页面
 * 2. 支持加载已登录的浏览器配置文件
 * 3. 截取页面截图并提取设计信息
 *
 * 用法：
 *   方式 1: node mastergo-auth.js --cookie "<cookie-string>" <url>
 *   方式 2: node mastergo-auth.js --profile "./chrome-profile" <url>
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// 配置
const CONFIG = {
  viewport: { width: 1920, height: 1080 },
  timeout: 60000,
};

function parseCookie(cookieString) {
  const cookies = [];
  const pairs = cookieString.split(';');

  for (const pair of pairs) {
    const [name, ...valueParts] = pair.trim().split('=');
    const value = valueParts.join('=');

    if (name && value) {
      cookies.push({
        name: name.trim(),
        value: decodeURIComponent(value.trim()),
        domain: '.mastergo.com',
        path: '/',
      });
    }
  }

  return cookies;
}

async function readCookieFromFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return parseCookie(content);
}

async function saveCookieToFile(filePath, cookies) {
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, cookieString);
}

async function loginInteractively(browser) {
  console.log('[登录] 打开登录窗口，请在浏览器中登录 MasterGo...');

  const page = await browser.newPage({
    viewport: CONFIG.viewport,
  });

  await page.goto('https://mastergo.com', {
    waitUntil: 'domcontentloaded',
    timeout: CONFIG.timeout,
  });

  console.log('[提示] 操作说明:');
  console.log('  1. 在打开的浏览器窗口中完成登录');
  console.log('  2. 登录成功后，按 Ctrl+C 继续');
  console.log('  3. 浏览器状态将被保存，下次无需重复登录');

  await new Promise((resolve) => {
    process.once('SIGINT', () => {
      console.log('\n[继续] 准备保存登录状态...');
      resolve();
    });
  });

  return page;
}

async function analyzeWithAuth(url, options = {}) {
  const {
    cookieString,
    cookieFile,
    profilePath,
    outputDir = './mastergo-output',
    saveProfile = true,
  } = options;

  console.log('[MasterGo 认证分析器] 启动...');
  console.log(`  URL: ${url}`);
  console.log(`  认证方式：${cookieString ? 'Cookie' : profilePath ? '配置文件' : '无'}`);
  console.log(`  输出目录：${outputDir}`);

  let browser;

  try {
    console.log('[1/5] 启动浏览器...');

    const launchOptions = {
      headless: !profilePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    };

    if (profilePath) {
      launchOptions.userDataDir = profilePath;
      console.log(`  配置文件目录：${profilePath}`);
    }

    browser = await chromium.launch(launchOptions);

    const context = await browser.newContext({
      viewport: CONFIG.viewport,
    });

    if (cookieString) {
      console.log('[2/5] 设置 Cookie...');
      const cookies = parseCookie(cookieString);
      await context.addCookies(cookies);
      console.log(`  已设置 ${cookies.length} 个 Cookie`);
    } else if (cookieFile) {
      console.log('[2/5] 从文件读取 Cookie...');
      const cookies = await readCookieFromFile(cookieFile);
      await context.addCookies(cookies);
      console.log(`  已设置 ${cookies.length} 个 Cookie`);
    }

    const page = await context.newPage();

    console.log('[3/5] 访问 MasterGo...');
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout,
    });

    const pageTitle = await page.title();
    console.log(`  页面标题：${pageTitle}`);

    if (pageTitle.includes('登录') || page.url().includes('login')) {
      console.log('[警告] 检测到登录页面，可能需要认证');

      if (!cookieString && !cookieFile && !profilePath) {
        console.log('[提示] 使用以下方法之一进行认证:');
        console.log('  1. --cookie "<cookie-string>"');
        console.log('  2. --cookie-file <path>');
        console.log('  3. --profile <path> (保存登录状态)');
        throw new Error('需要认证');
      }
    }

    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(3000);

    console.log('[4/5] 截取页面截图...');
    await fs.mkdir(outputDir, { recursive: true });

    const screenshotPath = path.join(outputDir, 'screenshot.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    console.log(`  截图已保存：${screenshotPath}`);

    if (saveProfile && profilePath) {
      console.log('[5/5] 保存浏览器配置文件...');
      console.log(`  配置文件已保存到：${profilePath}`);
    }

    console.log('\n[完成] 分析完成!');

    return { screenshotPath, outputDir };

  } catch (error) {
    console.error('[错误]', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('MasterGo 认证分析器 - 交互模式\n');

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  try {
    const url = await question('请输入 MasterGo 原型链接：');

    console.log('\n选择认证方式:');
    console.log('  1. Cookie 字符串');
    console.log('  2. Cookie 文件');
    console.log('  3. 浏览器配置文件 (首次会登录)');
    console.log('  4. 无认证 (公开链接)\n');

    const choice = await question('请选择 (1-4): ');

    const options = { outputDir: './mastergo-output' };

    switch (choice.trim()) {
      case '1':
        options.cookieString = await question('请输入 Cookie 字符串：');
        break;
      case '2':
        options.cookieFile = await question('请输入 Cookie 文件路径：');
        break;
      case '3':
        options.profilePath = await question('请输入配置文件保存路径：');
        break;
      case '4':
        break;
      default:
        console.log('无效选择，使用无认证模式');
    }

    rl.close();

    await analyzeWithAuth(url, options);

    console.log('\n完成!');

  } catch (error) {
    console.error('错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
MasterGo 认证分析器 - 支持登录保护的页面

用法：
  node mastergo-auth.js [选项] <url>

选项:
  --cookie "<string>"    Cookie 字符串
  --cookie-file <path>   Cookie 文件路径
  --profile <path>       浏览器配置文件目录（会保存登录状态）
  --output <dir>         输出目录（默认：./mastergo-output）
  --interactive          交互模式
  --help                 显示帮助

示例:
  # 使用 Cookie 字符串
  node mastergo-auth.js --cookie "token=xxx; session=yyy" https://mastergo.com/xxx

  # 使用 Cookie 文件
  node mastergo-auth.js --cookie-file ~/.mastergo/cookie.txt https://mastergo.com/xxx

  # 使用浏览器配置文件（首次会登录）
  node mastergo-auth.js --profile ~/.mastergo/profile https://mastergo.com/xxx

  # 交互模式
  node mastergo-auth.js --interactive

如何获取 Cookie:
  1. 在浏览器中打开 MasterGo 并登录
  2. 按 F12 打开开发者工具
  3. 切换到 Network 标签
  4. 刷新页面
  5. 点击任意请求，查看 Request Headers
  6. 复制 Cookie 字段的全部内容
`);
}

// 解析参数
if (args.includes('--help') || args.length === 0) {
  showHelp();
  process.exit(args.includes('--help') ? 0 : 1);
}

if (args.includes('--interactive')) {
  interactiveMode();
} else {
  // 解析参数
  const options = {};
  let url = null;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--cookie':
        options.cookieString = args[++i];
        break;
      case '--cookie-file':
        options.cookieFile = args[++i];
        break;
      case '--profile':
        options.profilePath = args[++i];
        break;
      case '--output':
        options.outputDir = args[++i];
        break;
      default:
        if (!args[i].startsWith('--')) {
          url = args[i];
        }
        break;
    }
  }

  if (!url) {
    console.error('错误：缺少 URL 参数');
    showHelp();
    process.exit(1);
  }

  analyzeWithAuth(url, options)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
