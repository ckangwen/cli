const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const cwd = process.cwd()

const generateTpl = content =>
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="index.css">
</head>
<body>
  ${content}
</body>
</html>
`

async function load(url, selector, output = './') {
  selector = selector.trim()
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  await page.content();
  const [ cssStyleMap, HtmlText ] = await page.evaluate((selector) => {
    let i = 0, domList = [], cssStyleMap = {};
    const container = document.querySelector(selector);
    const HtmlText = container.outerHTML

    domList.push({
      id: i,
      dom: container,
      parent: -1
    })
    let rules = [...document.styleSheets]
    rules = rules.filter(rule => !rule.href)
    rules = rules.map((sheet) => [...(sheet.cssRules || sheet.rules || [])].map((rule) => {
      if (rule instanceof CSSStyleRule) {
        return [rule]
      } else if (rule instanceof CSSMediaRule && window.matchMedia(rule.conditionText)) {
        return [...rule.cssRules]
      }
      return []
    }))
    rules = rules.reduce((acc, rules) => acc.concat(...rules), [])

    const getMatchedCSSStyleRule = (el) => {
      return  rules.filter((rule) => el.matches(rule.selectorText)).slice(0)
    }

    const getChildrenDeep = (el, parentId = i) => {
      if (!el.children.length) return
      for(let j = 0; j < el.children.length; j++) {
        ++i;
        const item = el.children[j]
        domList.push({
          id: i,
          dom: item,
          parentId
        })
        if (item.children && item.children.length > 0) {
          getChildrenDeep(item, i)
        }
      }
    }

    getChildrenDeep(container, i)

    domList.forEach(({ dom }) => {
      const rules = getMatchedCSSStyleRule(dom)
      rules.forEach(({selectorText, cssText}) => {
        if (selectorText) {
          cssStyleMap[selectorText] = cssText
        }
      })
    })


    return [cssStyleMap, HtmlText]
  }, selector)

  const cssText = Object.values(cssStyleMap).map(item => (item)).join('\n')

  const getDirPath = name => path.join(cwd, output, name)
  let name = `output-${Date.now()}`
  fs.mkdirSync(getDirPath(name))
  fs.writeFileSync(getDirPath(`${name}/index.html`), generateTpl(HtmlText))
  fs.writeFileSync(getDirPath(`${name}/index.css`), cssText)
  fs.writeFileSync(getDirPath(`${name}/index.txt`), JSON.stringify(cssStyleMap, null, 2))

  await browser.close()
}

module.exports = load
