// 从 @lobehub/icons 提取 SVG 数据，生成 lobeIcons.ts
// 优先提取 Color.js（彩色版），无 Color.js 时回退到 Mono.js（Avatar 风格渲染）
// 运行: node scripts/extract-lobe-icons.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = path.resolve(__dirname, '../node_modules/@lobehub/icons/es')
const OUTPUT_FILE = path.resolve(__dirname, '../src/xbUi/XbIcon/lobeIcons.ts')

// ─── 工具函数 ─────────────────────────────────────────────

function escapeSingleQuotes(str) {
  return str.replace(/'/g, "\\'")
}

/** React 属性名 → HTML 属性名 */
const REACT_TO_HTML = {
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  fillOpacity: 'fill-opacity',
  fillRule: 'fill-rule',
  clipRule: 'clip-rule',
  clipPath: 'clip-path',
  shapeRendering: 'shape-rendering',
  gradientUnits: 'gradientUnits',
  xlinkHref: 'xlink:href',
}

function toHtmlAttr(key) {
  return REACT_TO_HTML[key] || key
}

function skipWs(s, i) {
  while (i < s.length && /\s/.test(s[i])) i++
  return i
}

function skipWsAndComments(s, i) {
  i = skipWs(s, i)
  while (i < s.length - 1 && s[i] === '/' && s[i + 1] === '*') {
    const end = s.indexOf('*/', i + 2)
    if (end === -1) break
    i = end + 2
    i = skipWs(s, i)
  }
  return i
}

// ─── style.js 提取 ─────────────────────────────────────────

function extractStyleData(styleJsPath) {
  if (!fs.existsSync(styleJsPath)) return { color: '', avatarBg: '', avatarColor: '#fff', avatarMultiple: 0.6 }
  const content = fs.readFileSync(styleJsPath, 'utf-8')

  // 提取所有颜色变量
  const vars = {}
  const varRegex = /export\s+var\s+(\w+)\s*=\s*'([^']+)'/g
  let m
  while ((m = varRegex.exec(content)) !== null) {
    vars[m[1]] = m[2]
  }

  // 解析 AVATAR_ICON_MULTIPLE
  const multipleMatch = content.match(/AVATAR_ICON_MULTIPLE\s*=\s*([0-9.]+)/)
  const avatarMultiple = multipleMatch ? parseFloat(multipleMatch[1]) : 0.6

  // 解析 AVATAR_BACKGROUND（可能是变量引用或字面值）
  const bgMatch = content.match(/AVATAR_BACKGROUND\s*=\s*(.+?)[;,]?\s*$/m)
  let avatarBg = ''
  if (bgMatch) {
    let bgValue = bgMatch[1].trim()
    if (vars[bgValue]) avatarBg = vars[bgValue]
    else if (bgValue.startsWith("'") && bgValue.endsWith("'")) avatarBg = bgValue.slice(1, -1)
    else avatarBg = bgValue
  }

  // 解析 AVATAR_COLOR（可能是变量引用或字面值）
  const colorMatch2 = content.match(/AVATAR_COLOR\s*=\s*(.+?)[;,]?\s*$/m)
  let avatarColor = '#fff'
  if (colorMatch2) {
    let colorValue = colorMatch2[1].trim()
    if (vars[colorValue]) avatarColor = vars[colorValue]
    else if (colorValue.startsWith("'") && colorValue.endsWith("'")) avatarColor = colorValue.slice(1, -1)
    else avatarColor = colorValue
  }

  return {
    color: vars.COLOR_PRIMARY || '',
    avatarBg,
    avatarColor,
    avatarMultiple,
  }
}

// ─── useFillIds 变量映射提取 ────────────────────────────────

function extractFillIdVars(content, iconName) {
  const vars = new Map()

  // ── useFillIds (复数) ──
  const match = content.match(/useFillIds\(TITLE,\s*(\d+)\)/)
  if (match) {
    const varStart = content.indexOf('useFillIds(TITLE')
    const varEnd = content.indexOf('return ', varStart)
    const varBlock = content.substring(varStart, varEnd > varStart ? varEnd : varStart + 800)

    const destructRegex = /(\w+)\s*=\s*(\w+)\[(\d+)\]/g
    let m
    while ((m = destructRegex.exec(varBlock)) !== null) {
      vars.set(m[1], parseInt(m[3]))
    }
  }

  // ── useFillId (单数) ──
  const singleMatch = content.match(/var\s+(\w+)\s*=\s*useFillId\(TITLE\)/)
  if (singleMatch) {
    const objName = singleMatch[1]
    const varStart = content.indexOf('useFillId(TITLE')
    const varEnd = content.indexOf('return ', varStart)
    const varBlock = content.substring(varStart, varEnd > varStart ? varEnd : varStart + 800)

    const fillVarRegex = new RegExp(`(\\w+)\\s*=\\s*${objName}\\.fill`, 'g')
    const fillM = fillVarRegex.exec(varBlock)
    if (fillM) vars.set(fillM[1], 0)

    const idVarRegex = new RegExp(`(\\w+)\\s*=\\s*${objName}\\.id`, 'g')
    const idM = idVarRegex.exec(varBlock)
    if (idM) vars.set(idM[1], 0)
  }

  return vars
}

// ─── JSX → SVG 递归解析器 ──────────────────────────────────

function parseSvgChildren(content, fillIdVars, iconName) {
  const childrenIdx = findSvgChildrenArray(content)
  if (childrenIdx === -1) return null
  return parseChildElements(content, childrenIdx, fillIdVars, iconName)
}

function findSvgChildrenArray(content) {
  const svgMatch = content.match(/_(?:jsx|jsxs)\("svg",\s*/)
  if (!svgMatch) return -1

  const searchFrom = svgMatch.index
  const pattern = 'children: ['
  let pos = content.indexOf(pattern, searchFrom)
  if (pos === -1) {
    pos = content.indexOf('children:[', searchFrom)
    if (pos !== -1) return pos + 'children:'.length + 1
    return -1
  }
  return pos + 'children: '.length
}

function parseChildElements(content, afterBracket, fillIdVars, iconName) {
  const parts = []
  let i = skipWs(content, afterBracket)

  while (i < content.length && content[i] !== ']') {
    i = skipWsAndComments(content, i)

    const callMatch = content.substring(i).match(/^_(jsx|jsxs)\(/)
    if (callMatch) {
      const isJsxs = callMatch[1] === 'jsxs'
      const result = parseOneJsxCall(content, i, fillIdVars, iconName, isJsxs)
      if (result) {
        parts.push(result.html)
        i = result.endIdx
      } else {
        i = skipToEndOfCall(content, i)
      }
    } else if (content[i] === ',') {
      i = skipWs(content, i + 1)
    } else {
      i++
    }
  }

  return parts.length > 0 ? parts.join('') : null
}

function parseOneJsxCall(content, startIdx, fillIdVars, iconName, isJsxs) {
  let i = startIdx

  const funcName = isJsxs ? '_jsxs' : '_jsx'
  i += funcName.length
  i = skipWsAndComments(content, i)
  if (content[i] !== '(') return null
  i = skipWsAndComments(content, i + 1)

  const elemMatch = content.substring(i).match(/^"([^"]+)"/)
  if (!elemMatch) return null
  const elemName = elemMatch[1]
  i += elemMatch[0].length

  i = skipWsAndComments(content, i)
  if (content[i] !== ',') return null
  i = skipWsAndComments(content, i + 1)

  i = skipObjectSpread(content, i)
  i = skipWsAndComments(content, i)

  let propsHtml = ''
  let childrenHtml = ''
  let childArrayIdx = -1

  if (content[i] === '{') {
    const result = parsePropsAndChildren(content, i, fillIdVars, iconName)
    if (result) {
      propsHtml = result.htmlAttrs
      if (result.childType === 'array') {
        childArrayIdx = result.childIdx
      } else if (result.childType === 'single') {
        const singleResult = parseOneJsxCall(content, result.childIdx, fillIdVars, iconName, result.childIsJsxs)
        if (singleResult) childrenHtml = singleResult.html
      }
      i = result.endIdx
    } else {
      i = skipBraceBlock(content, i)
    }
  } else if (content.substring(i).startsWith('_objectSpread')) {
    const result = parseObjectSpreadProps(content, i, fillIdVars, iconName)
    if (result) {
      propsHtml = result.htmlAttrs
      if (result.childType === 'array') {
        childArrayIdx = result.childIdx
      } else if (result.childType === 'single') {
        const singleResult = parseOneJsxCall(content, result.childIdx, fillIdVars, iconName, result.childIsJsxs)
        if (singleResult) childrenHtml = singleResult.html
      }
      i = result.endIdx
    } else {
      i = skipToEndOfCall(content, i)
    }
  } else {
    i = skipToEndOfCall(content, startIdx)
  }

  if (childArrayIdx !== -1) {
    const childResult = parseChildElements(content, childArrayIdx, fillIdVars, iconName)
    if (childResult) childrenHtml = childResult
  }

  i = skipWs(content, i)
  if (content[i] === ')') i++

  if (elemName === 'title') {
    return { html: '', endIdx: i }
  }

  const selfClosing = ['path', 'rect', 'circle', 'ellipse', 'line', 'stop', 'use', 'image']
  if (selfClosing.includes(elemName)) {
    return { html: `<${elemName}${propsHtml}/>`, endIdx: i }
  }

  return { html: `<${elemName}${propsHtml}>${childrenHtml}</${elemName}>`, endIdx: i }
}

function skipObjectSpread(content, i) {
  i = skipWs(content, i)
  while (content.substring(i).startsWith('_objectSpread(')) {
    let depth = 0
    const start = i + '_objectSpread'.length
    let j = start
    while (j < content.length) {
      if (content[j] === '(') depth++
      else if (content[j] === ')') {
        depth--
        if (depth === 0) {
          i = j + 1
          break
        }
      }
      j++
    }
    i = skipWs(content, i)
    if (content[i] === ',') i = skipWs(content, i + 1)
  }
  return i
}

function parsePropsAndChildren(content, startIdx, fillIdVars, iconName) {
  let i = startIdx
  if (content[i] !== '{') return null
  i++

  const attrs = []
  let childType = 'none'
  let childIdx = -1
  let childIsJsxs = false

  while (i < content.length) {
    i = skipWsAndComments(content, i)
    if (content[i] === '}') {
      i++
      break
    }

    const childrenMatch = content.substring(i).match(/^children\s*:\s*/)
    if (childrenMatch) {
      i += childrenMatch[0].length
      i = skipWsAndComments(content, i)

      if (content[i] === '[') {
        childType = 'array'
        childIdx = i + 1
        let depth = 1
        i++
        while (i < content.length && depth > 0) {
          if (content[i] === '[') depth++
          else if (content[i] === ']') depth--
          i++
        }
      } else {
        const singleMatch = content.substring(i).match(/^_(jsx|jsxs)\(/)
        if (singleMatch) {
          childType = 'single'
          childIdx = i
          childIsJsxs = singleMatch[1] === 'jsxs'
          i = skipToEndOfCall(content, i)
        } else {
          childType = 'none'
          while (i < content.length && content[i] !== ',' && content[i] !== '}') i++
        }
      }
      i = skipWsAndComments(content, i)
      if (content[i] === ',') i = skipWsAndComments(content, i + 1)
      continue
    }

    const keyMatch = content.substring(i).match(/^(\w+)\s*:\s*/)
    if (!keyMatch) {
      i++
      continue
    }
    const key = keyMatch[1]
    i += keyMatch[0].length

    if (key === 'style' || key === 'className' || key === 'xmlns') {
      i = skipPropValue(content, i)
      i = skipWs(content, i)
      if (content[i] === ',') i = skipWs(content, i + 1)
      continue
    }

    const valueResult = parsePropValue(content, i, key, fillIdVars, iconName)
    if (valueResult) {
      if (valueResult.htmlAttr) attrs.push(valueResult.htmlAttr)
      i = valueResult.endIdx
    } else {
      i = skipPropValue(content, i)
    }

    i = skipWsAndComments(content, i)
    if (content[i] === ',') i = skipWsAndComments(content, i + 1)
  }

  const htmlAttrs = attrs.length > 0 ? ' ' + attrs.join(' ') : ''
  return { htmlAttrs, endIdx: i, childType, childIdx, childIsJsxs }
}

function parseObjectSpreadProps(content, startIdx, fillIdVars, iconName) {
  let endOfSpread = skipToEndOfCall(content, startIdx)
  const spreadContent = content.substring(startIdx, endOfSpread)

  const blocks = []
  let bi = 0
  while (bi < spreadContent.length) {
    if (spreadContent[bi] === '{') {
      const blockStart = bi
      let depth = 1
      bi++
      while (bi < spreadContent.length && depth > 0) {
        if (spreadContent[bi] === '{') depth++
        else if (spreadContent[bi] === '}') depth--
        bi++
      }
      blocks.push(spreadContent.substring(blockStart, bi))
    } else {
      bi++
    }
  }

  const attrs = []
  let childType = 'none'
  let childIdx = -1
  let childIsJsxs = false

  for (const block of blocks) {
    if (block.match(/children\s*:/)) {
      const childMatch = block.match(/children\s*:\s*\[/)
      if (childMatch) {
        childType = 'array'
        const blockOffset = content.indexOf(block, startIdx)
        const childKeyOffset = block.indexOf('children')
        const bracketOffset = block.indexOf('[', childKeyOffset)
        childIdx = blockOffset + bracketOffset + 1
      } else {
        const singleMatch = block.match(/children\s*:\s*_(jsx|jsxs)\(/)
        if (singleMatch) {
          childType = 'single'
          const blockOffset = content.indexOf(block, startIdx)
          const childKeyOffset = block.indexOf('children')
          const afterColon = block.indexOf('_', block.indexOf(':', childKeyOffset))
          childIdx = blockOffset + afterColon
          childIsJsxs = singleMatch[1] === 'jsxs'
        }
      }
    } else if (block.length > 2) {
      const parsed = parsePropsAndChildren(block, 0, fillIdVars, iconName)
      if (parsed && parsed.htmlAttrs) {
        attrs.push(parsed.htmlAttrs.trim())
      }
    }
  }

  const htmlAttrs = attrs.length > 0 ? ' ' + attrs.join(' ') : ''
  return { htmlAttrs, endIdx: endOfSpread, childType, childIdx, childIsJsxs }
}

function parsePropValue(content, startIdx, key, fillIdVars, iconName) {
  let i = startIdx
  const htmlKey = toHtmlAttr(key)

  if (content[i] === '"') {
    const endQ = content.indexOf('"', i + 1)
    if (endQ === -1) return null
    const value = content.substring(i + 1, endQ)
    i = endQ + 1
    return { htmlAttr: `${htmlKey}="${value}"`, endIdx: i }
  }

  const varRefMatch = content.substring(i).match(/^(\w+)\.(\w+)/)
  if (varRefMatch) {
    const varName = varRefMatch[1]
    const prop = varRefMatch[2]
    i += varRefMatch[0].length

    const idx = fillIdVars.get(varName)

    if (prop === 'fill' && idx !== undefined) {
      return { htmlAttr: `${htmlKey}="url(#lobe-${iconName}-${idx})"`, endIdx: i }
    }
    if (prop === 'id' && idx !== undefined) {
      return { htmlAttr: `${htmlKey}="lobe-${iconName}-${idx}"`, endIdx: i }
    }

    return { htmlAttr: null, endIdx: i }
  }

  const identMatch = content.substring(i).match(/^(\w+)/)
  if (identMatch) {
    const varName = identMatch[1]
    const idx = fillIdVars.get(varName)
    if (key === 'fill' && idx !== undefined) {
      return { htmlAttr: `${htmlKey}="url(#lobe-${iconName}-${idx})"`, endIdx: i + varName.length }
    }
    if (key === 'id' && idx !== undefined) {
      return { htmlAttr: `${htmlKey}="lobe-${iconName}-${idx}"`, endIdx: i + varName.length }
    }
    return { htmlAttr: null, endIdx: i + varName.length }
  }

  const numMatch = content.substring(i).match(/^(\d+\.?\d*)/)
  if (numMatch) {
    i += numMatch[0].length
    return { htmlAttr: `${htmlKey}="${numMatch[1]}"`, endIdx: i }
  }

  return null
}

function skipPropValue(content, i) {
  if (content[i] === '"') {
    const endQ = content.indexOf('"', i + 1)
    return endQ !== -1 ? endQ + 1 : i + 1
  }
  if (content[i] === '{') {
    let depth = 1
    i++
    while (i < content.length && depth > 0) {
      if (content[i] === '{') depth++
      else if (content[i] === '}') depth--
      i++
    }
    return i
  }
  if (content[i] === '(') {
    let depth = 1
    i++
    while (i < content.length && depth > 0) {
      if (content[i] === '(') depth++
      else if (content[i] === ')') depth--
      i++
    }
    return i
  }
  while (i < content.length && ![' ', '\t', '\n', ',', '}'].includes(content[i])) i++
  return i
}

function skipBraceBlock(content, i) {
  if (content[i] !== '{') return i + 1
  let depth = 1
  i++
  while (i < content.length && depth > 0) {
    if (content[i] === '{') depth++
    else if (content[i] === '}') depth--
    i++
  }
  return i
}

function skipToEndOfCall(content, startIdx) {
  let depth = 0
  let i = startIdx
  while (i < content.length) {
    if (content[i] === '(') depth++
    else if (content[i] === ')') {
      depth--
      if (depth === 0) return i + 1
    }
    i++
  }
  return i
}

// ─── Mono.js 提取（旧版简单解析，用作回退） ────────────────────────────────────────────

function extractMonoDataLegacy(monoJsPath) {
  const content = fs.readFileSync(monoJsPath, 'utf-8')
  const viewBoxMatch = content.match(/viewBox:\s*"([^"]+)"/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'

  const paths = []
  const pathRegex = /\/\*#__PURE__\*\/_jsx\("path",\s*\{([^}]+)\}\)/g
  let match
  while ((match = pathRegex.exec(content)) !== null) {
    const attrs = match[1]
    const dMatch = attrs.match(/d:\s*"([^"]+)"/)
    if (dMatch) {
      const extraAttrs = []
      const fillRuleMatch = attrs.match(/fillRule:\s*"([^"]+)"/)
      if (fillRuleMatch && fillRuleMatch[1] !== 'evenodd') {
        extraAttrs.push(`fill-rule="${fillRuleMatch[1]}"`)
      }
      const clipRuleMatch = attrs.match(/clipRule:\s*"([^"]+)"/)
      if (clipRuleMatch) {
        extraAttrs.push(`clip-rule="${clipRuleMatch[1]}"`)
      }
      const pathAttrStr = extraAttrs.length ? ` ${extraAttrs.join(' ')}` : ''
      paths.push(`<path d="${dMatch[1]}"${pathAttrStr}/>`)
    }
  }

  return paths.length > 0 ? { viewBox, paths: paths.join('') } : null
}

// ─── Mono.js 提取 ────────────────────────────────────────────

function extractMonoData(monoJsPath) {
  const content = fs.readFileSync(monoJsPath, 'utf-8')
  const viewBoxMatch = content.match(/viewBox:\s*"([^"]+)"/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'

  const fillIdVars = extractFillIdVars(content, '')
  const innerHtml = parseSvgChildren(content, fillIdVars, '')
  if (innerHtml) return { viewBox, paths: innerHtml }

  // 回退到简单提取
  return extractMonoDataLegacy(monoJsPath)
}

// ─── Color.js 提取 ────────────────────────────────────────────

function extractColorData(colorJsPath, iconName) {
  const content = fs.readFileSync(colorJsPath, 'utf-8')
  const viewBoxMatch = content.match(/viewBox:\s*"([^"]+)"/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'

  // 提取 SVG 根元素的 fill 属性
  let svgFill = null
  const svgIdx = content.indexOf('_jsxs("svg"')
  if (svgIdx !== -1) {
    const childrenIdx = content.indexOf('children:', svgIdx)
    const blockEnd = childrenIdx !== -1 ? childrenIdx : svgIdx + 1200
    const svgBlock = content.substring(svgIdx, blockEnd)
    const fillMatch = svgBlock.match(/fill:\s*"([^"]+)"/)
    if (fillMatch) svgFill = fillMatch[1]
  }

  const fillIdVars = extractFillIdVars(content, iconName)
  let innerHtml = parseSvgChildren(content, fillIdVars, iconName)
  if (!innerHtml) return null

  // 如果 SVG 根有具体 fill（非 none/currentColor），且 children 中没有元素带 fill
  if (svgFill && svgFill !== 'none' && svgFill !== 'currentColor') {
    const hasElementFill = /<(?:path|rect|circle|ellipse|line|polyline|polygon|g)\b[^>]*\bfill=/.test(innerHtml)
    if (!hasElementFill) {
      innerHtml = innerHtml.replace(
        /<(path|rect|circle|ellipse|line|polyline|polygon|g)\b(?![^>]*\bfill=)/g,
        `<$1 fill="${svgFill}"`
      )
    }
  }

  return { viewBox, paths: innerHtml }
}

// ─── 主流程 ────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(ICONS_DIR)) {
    console.error(`❌ 目录不存在: ${ICONS_DIR}`)
    console.error('请先安装 @lobehub/icons: pnpm add @lobehub/icons')
    process.exit(1)
  }

  const entries = fs.readdirSync(ICONS_DIR, { withFileTypes: true })
  const iconDirs = entries
    .filter((e) => e.isDirectory() && /^[A-Z]/.test(e.name))
    .map((e) => e.name)
    .sort()

  const icons = {}
  const iconNames = []
  let colorCount = 0
  let monoCount = 0
  let failCount = 0

  for (const dir of iconDirs) {
    const colorJsPath = path.join(ICONS_DIR, dir, 'components', 'Color.js')
    const monoJsPath = path.join(ICONS_DIR, dir, 'components', 'Mono.js')
    const stylePath = path.join(ICONS_DIR, dir, 'style.js')

    const styleData = extractStyleData(stylePath)
    let data = null
    let hasColor = false

    // 优先提取 Color.js
    if (fs.existsSync(colorJsPath)) {
      data = extractColorData(colorJsPath, dir)
      if (data) {
        hasColor = true
        colorCount++
      }
    }

    // 回退到 Mono.js
    if (!data && fs.existsSync(monoJsPath)) {
      data = extractMonoData(monoJsPath)
      if (data) {
        monoCount++
      }
    }

    if (data) {
      data.hasColor = hasColor
      data.color = hasColor ? '' : styleData.color
      data.avatarBg = styleData.avatarBg || styleData.color
      data.avatarColor = styleData.avatarColor
      data.avatarMultiple = styleData.avatarMultiple
      icons[dir] = data
      iconNames.push(dir)
    } else {
      failCount++
      console.warn(`  ⚠ 跳过: ${dir}（无有效 SVG 数据）`)
    }
  }

  console.log(`✅ 成功提取 ${iconNames.length} 个 LobeHub 图标`)
  console.log(`   彩色(Color): ${colorCount}, 单色(Mono): ${monoCount}, 跳过: ${failCount}`)

  // 生成 TypeScript 文件
  const typeUnion = iconNames.map((n) => `'${n}'`).join(' | ')

  const lines = [
    `// Auto-generated by scripts/extract-lobe-icons.mjs`,
    `// DO NOT EDIT MANUALLY - Run "node scripts/extract-lobe-icons.mjs" to regenerate`,
    ``,
    `export interface LobeIconData {`,
    `  viewBox: string`,
    `  paths: string`,
    `  /** Mono 版本的品牌色（Avatar 背景色），Color 版本为空 */`,
    `  color: string`,
    `  /** 是否有彩色版本（含渐变/多色填充） */`,
    `  hasColor: boolean`,
    `  /** Avatar 背景色（用于 Mono 图标的圆形背景） */`,
    `  avatarBg: string`,
    `  /** Avatar 图标色（用于 Mono 图标在圆形背景上的颜色） */`,
    `  avatarColor: string`,
    `  /** Avatar 图标缩放比例 */`,
    `  avatarMultiple: number`,
    `}`,
    ``,
    `export type LobeIconName = ${typeUnion || 'string'}`,
    ``,
    `export const lobeIcons: Record<string, LobeIconData> = {`,
  ]

  for (const name of iconNames) {
    const { viewBox, paths, color, hasColor, avatarBg, avatarColor, avatarMultiple } = icons[name]
    lines.push(
      `  '${name}': { viewBox: '${viewBox}', paths: '${escapeSingleQuotes(paths)}', color: '${color}', hasColor: ${hasColor}, avatarBg: '${avatarBg}', avatarColor: '${avatarColor}', avatarMultiple: ${avatarMultiple} },`,
    )
  }

  lines.push(`}`)
  lines.push(``)
  lines.push(`export const lobeIconNames: string[] = [`)
  for (const name of iconNames) {
    lines.push(`  '${name}',`)
  }
  lines.push(`]`)
  lines.push(``)

  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf-8')
  console.log(`📄 已生成: ${OUTPUT_FILE}`)
}

main()
