#!/usr/bin/env node
/**
 * MasterGo 元素定位分析器
 *
 * 功能:
 * 1. 通过 CSS 选择器定位特定元素
 * 2. 截取该元素的截图（带高亮标注）
 * 3. 提取该元素的详细样式和布局信息
 * 4. 与现有代码对比，生成修改建议
 *
 * 用法：node mastergo-element.js <url> <selector> [output-dir]
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  viewport: { width: 1920, height: 1080 },
  timeout: 30000,
  highlightColor: 'rgba(255, 0, 0, 0.3)',
  highlightBorder: '3px solid red',
};

// 注入高亮脚本
async function highlightElement(page, selector) {
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      // 保存原始样式
      const originalStyle = element.getAttribute('style') || '';
      element.setAttribute('data-original-style', originalStyle);

      // 添加高亮
      element.style.outline = '3px solid red';
      element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';

      // 滚动到视图中
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, selector);
}

// 恢复元素原始样式
async function restoreElementStyle(page, selector) {
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      const originalStyle = element.getAttribute('data-original-style');
      if (originalStyle !== null) {
        element.setAttribute('style', originalStyle);
      }
    }
  }, selector);
}

// 提取元素详细信息
async function extractElementDetail(page, selector) {
  return await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      return { error: `未找到元素：${selector}` };
    }

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    // 获取所有属性
    const attributes = {};
    for (const attr of element.attributes) {
      if (!attr.name.startsWith('data-') || attr.name === 'data-testid') {
        attributes[attr.name] = attr.value;
      }
    }

    // 获取子元素文本
    const textContent = element.textContent?.trim().slice(0, 500);

    // 获取背景图片
    const backgroundImage = style.backgroundImage;
    const hasImage = backgroundImage && backgroundImage !== 'none';

    // 检测交互状态
    const isInteractive =
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.onclick !== null ||
      style.cursor === 'pointer';

    // 层级信息
    let depth = 0;
    let parent = element.parentElement;
    while (parent) {
      depth++;
      parent = parent.parentElement;
    }

    return {
      selector,
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: element.className?.split(' ').filter(c => c) || [],
      attributes,

      // 位置
      bounds: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
      },

      // 样式详情
      styles: {
        // 布局
        display: style.display,
        position: style.position,
        zIndex: style.zIndex,

        // Flexbox
        flexDirection: style.flexDirection,
        justifyContent: style.justifyContent,
        alignItems: style.alignItems,
        flexWrap: style.flexWrap,
        gap: style.gap,

        // Grid
        gridTemplateColumns: style.gridTemplateColumns,
        gridTemplateRows: style.gridTemplateRows,
        gridColumn: style.gridColumn,
        gridRow: style.gridRow,

        // 间距
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

        // 尺寸
        width: style.width,
        height: style.height,
        minWidth: style.minWidth,
        minHeight: style.minHeight,
        maxWidth: style.maxWidth,
        maxHeight: style.maxHeight,

        // 排版
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        textAlign: style.textAlign,
        textDecoration: style.textDecoration,
        textTransform: style.textTransform,
        color: style.color,

        // 背景
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        backgroundSize: style.backgroundSize,
        backgroundPosition: style.backgroundPosition,

        // 边框
        border: {
          top: style.borderTop,
          right: style.borderRight,
          bottom: style.borderBottom,
          left: style.borderLeft,
        },
        borderTopWidth: style.borderTopWidth,
        borderRightWidth: style.borderRightWidth,
        borderBottomWidth: style.borderBottomWidth,
        borderLeftWidth: style.borderLeftWidth,
        borderRadius: style.borderRadius,
        borderColor: style.borderColor,
        borderStyle: style.borderStyle,

        // 阴影
        boxShadow: style.boxShadow,
        textShadow: style.textShadow,

        // 效果
        opacity: style.opacity,
        transform: style.transform,
        transition: style.transition,
        filter: style.filter,

        // 溢出
        overflow: style.overflow,
        overflowX: style.overflowX,
        overflowY: style.overflowY,

        // 其他
        cursor: style.cursor,
        visibility: style.visibility,
        pointerEvents: style.pointerEvents,
      },

      // 内容
      text: textContent,
      hasImage,
      isInteractive,
      depth,

      // 父子关系
      parentTag: element.parentElement?.tagName?.toLowerCase() || null,
      childCount: element.children.length,
    };
  }, selector);
}

// 生成对比报告
async function generateComparisonReport(elementInfo, existingCode) {
  const report = {
    elementSelector: elementInfo.selector,
    timestamp: new Date().toISOString(),
    comparisons: [],
    suggestions: [],
  };

  // 如果没有现有代码，只输出设计规格
  if (!existingCode) {
    report.suggestions.push({
      type: 'info',
      message: '未提供现有代码，以下是设计规格：',
      spec: elementInfo,
    });
    return report;
  }

  // 对比逻辑（简化版）
  // 实际使用中可以根据现有代码的样式进行对比

  return report;
}

// 主函数
async function analyzeElement(url, selector, outputDir = './mastergo-element-output') {
  console.log('[MasterGo 元素分析器] 启动分析...');
  console.log(`  URL: ${url}`);
  console.log(`  选择器：${selector}`);
  console.log(`  输出目录：${outputDir}`);

  let browser;

  try {
    // 启动浏览器
    console.log('[1/5] 启动无头浏览器...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage({
      viewport: CONFIG.viewport,
    });

    // 访问页面
    console.log('[2/5] 访问 MasterGo 原型...');
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout,
    });

    // 等待内容加载
    await page.waitForSelector('body', { timeout: 5000 });
    await page.waitForTimeout(2000);

    // 检查元素是否存在
    console.log('[3/5] 定位目标元素...');
    const elementHandle = await page.$(selector);

    if (!elementHandle) {
      console.error(`[错误] 未找到元素：${selector}`);
      console.log('提示：');
      console.log('  1. 检查选择器是否正确（使用浏览器开发者工具验证）');
      console.log('  2. 尝试使用更简单的选择器（如类名、ID）');
      console.log('  3. 确认页面已完全加载');
      throw new Error(`Element not found: ${selector}`);
    }

    // 高亮元素
    console.log('[4/5] 截取元素截图（带高亮）...');
    await highlightElement(page, selector);
    await page.waitForTimeout(300); // 等待高亮渲染

    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true });

    // 截取元素截图
    const elementScreenshotPath = path.join(outputDir, 'element-highlight.png');
    await elementHandle.screenshot({ path: elementScreenshotPath });
    console.log(`  元素截图已保存：${elementScreenshotPath}`);

    // 也截取完整页面（带高亮）
    const pageScreenshotPath = path.join(outputDir, 'page-with-highlight.png');
    await page.screenshot({ path: pageScreenshotPath, fullPage: true });
    console.log(`  页面截图已保存：${pageScreenshotPath}`);

    // 恢复原始样式
    await restoreElementStyle(page, selector);

    // 截取原始截图（无高亮）
    const originalScreenshotPath = path.join(outputDir, 'element-original.png');
    await elementHandle.screenshot({ path: originalScreenshotPath });
    console.log(`  原始元素截图已保存：${originalScreenshotPath}`);

    // 提取元素详细信息
    console.log('[5/5] 提取元素详细信息...');
    const elementInfo = await extractElementDetail(page, selector);

    if (elementInfo.error) {
      console.error(`[错误] ${elementInfo.error}`);
      throw new Error(elementInfo.error);
    }

    // 写入 JSON
    const jsonPath = path.join(outputDir, 'element-info.json');
    await fs.writeFile(jsonPath, JSON.stringify(elementInfo, null, 2));
    console.log(`  元素信息已保存：${jsonPath}`);

    // 生成 CSS 代码片段
    const cssSnippet = generateCSSSnippet(elementInfo);
    const cssPath = path.join(outputDir, 'element.css');
    await fs.writeFile(cssPath, cssSnippet);
    console.log(`  CSS 代码片段已保存：${cssPath}`);

    // 生成 Tailwind 代码片段
    const tailwindSnippet = generateTailwindSnippet(elementInfo);
    const tailwindPath = path.join(outputDir, 'element.tailwind.txt');
    await fs.writeFile(tailwindPath, tailwindSnippet);
    console.log(`  Tailwind 类名已保存：${tailwindPath}`);

    console.log('\n[完成] 元素分析完成!');
    console.log('\n文件列表:');
    console.log(`  - ${elementScreenshotPath} (高亮截图)`);
    console.log(`  - ${pageScreenshotPath} (页面带高亮)`);
    console.log(`  - ${originalScreenshotPath} (原始截图)`);
    console.log(`  - ${jsonPath} (元素信息)`);
    console.log(`  - ${cssPath} (CSS 代码)`);
    console.log(`  - ${tailwindPath} (Tailwind 类名)`);

    console.log('\n[使用提示]');
    console.log('在 Claude Code 中:');
    console.log('  1. 查看 element-highlight.png 了解目标元素位置');
    console.log('  2. 读取 element-info.json 获取详细规格');
    console.log('  3. 使用 element.css 或 element.tailwind.txt 快速实现');

    return { elementInfo, outputDir };

  } catch (error) {
    console.error('[错误]', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 生成 CSS 代码片段
function generateCSSSnippet(info) {
  if (info.error) return '/* 元素信息获取失败 */';

  const { styles, bounds } = info;

  return `/* MasterGo 元素样式 - ${info.selector} */
/* 尺寸：${bounds.width}x${bounds.height} */

.element {
  /* 布局 */
  display: ${styles.display};
  position: ${styles.position};
  ${styles.position !== 'static' ? `top: ${styles.top};` : ''}
  ${styles.zIndex !== 'auto' ? `z-index: ${styles.zIndex};` : ''}

  /* 尺寸 */
  width: ${styles.width};
  height: ${styles.height};
  ${styles.minWidth !== 'auto' ? `min-width: ${styles.minWidth};` : ''}
  ${styles.minHeight !== 'auto' ? `min-height: ${styles.minHeight};` : ''}

  /* 间距 */
  margin: ${styles.margin.top} ${styles.margin.right} ${styles.margin.bottom} ${styles.margin.left};
  padding: ${styles.padding.top} ${styles.padding.right} ${styles.padding.bottom} ${styles.padding.left};
  ${styles.gap !== 'normal' ? `gap: ${styles.gap};` : ''}

  /* Flexbox */
  ${styles.display === 'flex' ? `
  flex-direction: ${styles.flexDirection};
  justify-content: ${styles.justifyContent};
  align-items: ${styles.alignItems};
  ` : ''}

  /* 排版 */
  font-size: ${styles.fontSize};
  font-family: ${styles.fontFamily};
  font-weight: ${styles.fontWeight};
  line-height: ${styles.lineHeight};
  color: ${styles.color};
  text-align: ${styles.textAlign};

  /* 背景 */
  background-color: ${styles.backgroundColor};
  ${styles.backgroundImage !== 'none' ? `background-image: ${styles.backgroundImage};` : ''}

  /* 边框 */
  border: ${styles.border.top};
  border-radius: ${styles.borderRadius};

  /* 阴影 */
  ${styles.boxShadow !== 'none' ? `box-shadow: ${styles.boxShadow};` : ''}

  /* 效果 */
  opacity: ${styles.opacity};
  cursor: ${styles.cursor};
}`;
}

// 生成 Tailwind 类名（简化版）
function generateTailwindSnippet(info) {
  if (info.error) return '<!-- 元素信息获取失败 -->';

  const { styles, bounds } = info;
  const classes = [];

  // 布局
  if (styles.display === 'flex') classes.push('flex');
  if (styles.display === 'grid') classes.push('grid');
  if (styles.display === 'block') classes.push('block');
  if (styles.display === 'inline-block') classes.push('inline-block');

  // Flex 方向
  if (styles.flexDirection === 'column') classes.push('flex-col');
  if (styles.flexDirection === 'row-reverse') classes.push('flex-row-reverse');

  // 对齐
  if (styles.justifyContent === 'center') classes.push('justify-center');
  if (styles.justifyContent === 'flex-end') classes.push('justify-end');
  if (styles.justifyContent === 'space-between') classes.push('justify-between');

  if (styles.alignItems === 'center') classes.push('items-center');
  if (styles.alignItems === 'flex-end') classes.push('items-end');

  // 间距（近似转换）
  const pxToTailwind = {
    '4px': '1', '8px': '2', '12px': '3', '16px': '4',
    '20px': '5', '24px': '6', '32px': '8', '40px': '10',
    '48px': '12', '64px': '16'
  };

  // 字体大小
  const fontSizeMap = {
    '12px': 'text-xs', '14px': 'text-sm', '16px': 'text-base',
    '18px': 'text-lg', '20px': 'text-xl', '24px': 'text-2xl',
    '32px': 'text-3xl', '48px': 'text-4xl'
  };

  // 字体粗细
  const fontWeightMap = {
    '400': 'font-normal', '500': 'font-medium',
    '600': 'font-semibold', '700': 'font-bold'
  };

  if (fontSizeMap[styles.fontSize]) classes.push(fontSizeMap[styles.fontSize]);
  if (fontWeightMap[styles.fontWeight]) classes.push(fontWeightMap[styles.fontWeight]);

  // 颜色（需要转换 RGB 到 Tailwind 色值，这里简化处理）
  if (styles.color !== 'rgb(0, 0, 0)' && styles.color !== 'rgba(0, 0, 0, 0)') {
    classes.push(`[color:${styles.color}]`);
  }
  if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
      styles.backgroundColor !== 'transparent') {
    classes.push(`[background-color:${styles.backgroundColor}]`);
  }

  // 边框
  if (styles.borderRadius === '4px') classes.push('rounded');
  if (styles.borderRadius === '8px') classes.push('rounded-lg');
  if (styles.borderRadius === '9999px') classes.push('rounded-full');

  // 阴影
  if (styles.boxShadow !== 'none') classes.push('shadow');

  return `<!-- MasterGo 元素 - ${info.selector} -->
<!-- 尺寸：${bounds.width}x${bounds.height} -->

<div class="${classes.join(' ')}">
  <!-- 内容 -->
</div>

/*
注意：以下是自动生成的 Tailwind 类名，可能需要手动调整。
建议结合 design-tokens.json 中的精确颜色值使用。
*/`;
}

// CLI 入口
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('用法：node mastergo-element.js <url> <selector> [output-dir]');
  console.log('\n参数说明:');
  console.log('  <url>       MasterGo 原型链接');
  console.log('  <selector>  CSS 选择器（如：.button-primary, #login-form, .card > h2）');
  console.log('  [output-dir] 输出目录（默认：./mastergo-element-output）');
  console.log('\n示例:');
  console.log('  node mastergo-element.js https://mastergo.com/xxx/yyy ".submit-btn"');
  console.log('  node mastergo-element.js https://mastergo.com/xxx/yyy "#header-nav" ./output');
  console.log('\n提示:');
  console.log('  在 MasterGo 或浏览器中使用开发者工具找到元素的选择器');
  process.exit(1);
}

const [url, selector, outputDir] = args;

analyzeElement(url, selector, outputDir)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
