#!/usr/bin/env node
/**
 * MasterGo 原型分析器
 *
 * 功能:
 * 1. 无头浏览器访问 MasterGo 原型链接
 * 2. 截取页面截图
 * 3. 提取 DOM 结构 + 计算样式
 * 4. 输出结构化 JSON 和截图
 *
 * 用法：npx node mastergo-analyzer.js <prototype-url> [output-dir]
 *
 * 注意：请通过 npx 运行以正确加载 playwright 模块
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  viewport: { width: 1920, height: 1080 },
  waitForSelector: '#root, #__next, .app, body',
  timeout: 30000,
};

function extractElementInfo(element) {
  return element.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);

    const info = {
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      className: el.className || null,

      bounds: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },

      styles: {
        display: style.display,
        position: style.position,
        flex: style.flex,
        grid: style.grid,

        margin: {
          top: style.marginTop,
          right: style.marginRight,
          bottom: style.marginBottom,
          left: style.marginLeft,
        },
        padding: {
          top: style.paddingTop,
          right: style.paddingRight,
          bottom: style.paddingBottom,
          left: style.paddingLeft,
        },
        gap: style.gap,

        width: style.width,
        height: style.height,
        minWidth: style.minWidth,
        minHeight: style.minHeight,

        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        color: style.color,
        textAlign: style.textAlign,

        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,

        border: {
          top: style.borderTop,
          right: style.borderRight,
          bottom: style.borderBottom,
          left: style.borderLeft,
        },
        borderRadius: style.borderRadius,

        boxShadow: style.boxShadow,

        opacity: style.opacity,
        zIndex: style.zIndex,
        overflow: style.overflow,
      },

      text: el.textContent?.trim().slice(0, 200) || null,
    };

    return info;
  });
}

async function extractDOMTree(element, maxDepth = 4, currentDepth = 0) {
  if (currentDepth >= maxDepth) return null;

  const info = await extractElementInfo(element);

  const children = await element.$$('> *');
  if (children.length > 0) {
    info.children = [];
    for (const child of children) {
      const childInfo = await extractDOMTree(child, maxDepth, currentDepth + 1);
      if (childInfo) {
        info.children.push(childInfo);
      }
    }
  }

  return info;
}

function extractDesignTokens(domTree) {
  const tokens = {
    colors: new Set(),
    fonts: new Set(),
    fontSizes: new Set(),
    spacing: new Set(),
  };

  function traverse(node) {
    if (!node) return;

    if (node.styles?.color && node.styles.color !== 'rgba(0, 0, 0, 0)') {
      tokens.colors.add(node.styles.color);
    }
    if (node.styles?.backgroundColor && node.styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      tokens.colors.add(node.styles.backgroundColor);
    }

    if (node.styles?.fontFamily) {
      tokens.fonts.add(node.styles.fontFamily);
    }
    if (node.styles?.fontSize) {
      tokens.fontSizes.add(node.styles.fontSize);
    }

    if (node.styles?.margin?.top && node.styles.margin.top !== '0px') {
      tokens.spacing.add(node.styles.margin.top);
    }
    if (node.styles?.padding?.top) {
      tokens.spacing.add(node.styles.padding.top);
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(domTree);

  return {
    colors: Array.from(tokens.colors),
    fonts: Array.from(tokens.fonts),
    fontSizes: Array.from(tokens.fontSizes),
    spacing: Array.from(tokens.spacing).sort((a, b) =>
      parseInt(a) - parseInt(b)
    ),
  };
}

async function analyzeMasterGo(url, outputDir = './mastergo-output') {
  console.log('[MasterGo Analyzer] 启动分析...');
  console.log(`  URL: ${url}`);
  console.log(`  输出目录：${outputDir}`);

  let browser;

  try {
    console.log('[1/4] 启动无头浏览器...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage({
      viewport: CONFIG.viewport,
    });

    console.log('[2/4] 访问 MasterGo 原型...');
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout,
    });

    await page.waitForSelector(CONFIG.waitForSelector, {
      timeout: 5000,
    }).catch(() => {
      console.warn('  未找到常见根元素，继续执行...');
    });

    await page.waitForTimeout(2000);

    console.log('[3/4] 截取页面截图...');
    const screenshotPath = path.join(outputDir, 'screenshot.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    console.log(`  截图已保存：${screenshotPath}`);

    const screenshotPath = path.join(outputDir, 'screenshot.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    console.log(`  截图已保存：${screenshotPath}`);

    console.log('[4/4] 提取 DOM 结构和样式...');
    const bodyElement = await page.$('body');
    const domTree = await extractDOMTree(bodyElement, 5);

    const designTokens = extractDesignTokens(domTree);

    const output = {
      url,
      analyzedAt: new Date().toISOString(),
      viewport: CONFIG.viewport,
      domTree,
      designTokens,
      metadata: {
        title: await page.title(),
        url: page.url,
      },
    };

    await fs.mkdir(outputDir, { recursive: true });

    // 并行写入所有文件
    const jsonPath = path.join(outputDir, 'analysis.json');
    const tokensPath = path.join(outputDir, 'design-tokens.json');

    await Promise.all([
      fs.writeFile(jsonPath, JSON.stringify(output, null, 2)),
      fs.writeFile(tokensPath, JSON.stringify(designTokens, null, 2)),
    ]);

    console.log(`  分析数据已保存：${jsonPath}`);
    console.log(`  设计令牌已保存：${tokensPath}`);

    console.log('\n[完成] 分析完成!');

    return output;

  } catch (error) {
    console.error('[错误]', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// CLI 入口
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('用法：node mastergo-analyzer.js <prototype-url> [output-dir]');
  console.log('\n示例:');
  console.log('  node mastergo-analyzer.js https://mastergo.com/xxx/yyy');
  console.log('  node mastergo-analyzer.js https://mastergo.com/xxx/yyy ./output');
  process.exit(1);
}

const [url, outputDir] = args;

analyzeMasterGo(url, outputDir)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
