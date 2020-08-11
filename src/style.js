const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const cwd = process.cwd()
let map = {
  "align-content": "normal",
  "align-items": "normal",
  "align-self": "auto",
  "background-attachment": "scroll",
  "background-clip": "border-box",
  "background-color": "rgba(0, 0, 0, 0)",
  "background-image": "none",
  "background-origin": "padding-box",
  "background-position": "0% 0%",
  "background-repeat": "repeat",
  "background-size": "auto",
  "background": "rgba(0, 0, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box",
  "border-bottom": "0px none rgb(0, 0, 0)",
  "border-bottom-left-radius": "0px",
  "border-bottom-right-radius": "0px",
  "border-color": "rgb(0, 0, 0)",
  "border-left": "0px none rgb(0, 0, 0)",
  "border-radius": "0px",
  "border-right": "0px none rgb(0, 0, 0)",
  "border-style": "none",
  "border-top-left-radius": "0px",
  "border-top-right-radius": "0px",
  "border-top": "0px none rgb(0, 0, 0)",
  "border-width": "0px",
  "border": "0px none rgb(0, 0, 0)",
  "bottom": "auto",
  "box-shadow": "none",
  "box-sizing": "content-box",
  "clear": "none",
  "color": "rgb(0, 0, 0)",
  "column-count": "auto",
  "column-gap": "normal",
  "column-width": "auto",
  "content": "normal",
  "cursor": "auto",
  "display": "block",
  "flex-basis": "auto",
  "flex-direction": "row",
  "flex-flow": "row nowrap",
  "flex-grow": "0",
  "flex-shrink": "1",
  "flex-wrap": "nowrap",
  "float": "none",
  "font-size": "16px",
  "font-style": "normal",
  "font-variant": "normal",
  "font-weight": "400",
  "grid": "none / none / none / row / auto / auto",
  "height": "0px",
  "justify-content": "normal",
  "left": "auto",
  "letter-spacing": "normal",
  "line-height": "normal",
  "list-style-image": "none",
  "list-style-position": "outside",
  "list-style-type": "disc",
  "list-style": "disc outside none",
  "margin-bottom": "0px",
  "margin-left": "0px",
  "margin-right": "0px",
  "margin-top": "0px",
  "margin": "0px",
  "max-height": "none",
  "max-width": "none",
  "min-height": "0px",
  "min-width": "0px",
  "mix-blend-mode": "normal",
  "opacity": "1",
  "order": "0",
  "outline": "rgb(0, 0, 0) none 0px",
  "overflow-wrap": "normal",
  "overflow-x": "visible",
  "overflow-y": "visible",
  "overflow": "visible",
  "padding-bottom": "0px",
  "padding-left": "0px",
  "padding-right": "0px",
  "padding-top": "0px",
  "padding": "0px",
  "pointer-events": "auto",
  "position": "static",
  "resize": "none",
  "right": "auto",
  "text-align": "start",
  "text-decoration": "none solid rgb(0, 0, 0)",
  "text-indent": "0px",
  "text-overflow": "clip",
  "text-shadow": "none",
  "text-transform": "none",
  "top": "auto",
  "transform-origin": "675px 0px",
  "transform": "none",
  "transition-delay": "0s",
  "transition-duration": "0s",
  "transition-property": "all",
  "transition-timing-function": "ease",
  "transition": "all 0s ease 0s",
  "vertical-align": "baseline",
  "white-space": "normal",
  "width": "1350px",
  "will-change": "auto",
  "word-break": "normal",
  "word-spacing": "0px",
  "z-index": "auto"
}

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

const classTextToSelector = str => {
  let arr = str.split(' ')
  if (arr[0] !== '') arr.unshift('')
  return arr.join('.')
}

function getSelectorDeep(container, $) {
  let selectors = []
  container.each(function(index, ele) {
    const el = $(this)
    selectors.push(getSelector(el))
    if (el.children().length > 0) {
      const childselectors = getSelectorDeep(el.children(), $)
      selectors = selectors.concat(childselectors)
    }
  })
  return selectors
}

const getSelector = (el) => {
  if (el.attr('class')) {
    return el.attr('class')
  }
  if (el.attr('id')) {
    return el.attr('id')
  }
  return `${getSelector(el.parent())}>${el.get(0).tagName}`
}

async function load(url, selector, output = './') {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  const content = await page.content();
  const $ = cheerio.load(content);
  const container = $(selector)
  let classes = getSelectorDeep(container, $)
  classes = [...new Set(classes)]
  const styles = await page.evaluate((classes, map) => {
    const classTextToSelector = str => {
      let arr = str.split(' ')
      if (arr[0] !== '') arr.unshift('')
      return arr.join('.')
    }
    return classes.map(item => {
      const style = window.getComputedStyle(document.querySelector(classTextToSelector(item)), null)
      let css = {}
      Object.keys(map).forEach(key => {
        const val = style.getPropertyValue(key)
        if (key === 'margin' || key === 'padding') {
          css[key] = val
        } else if (val !== map[key]) {
          css[key] = val
        }
      })

      return css
    })

  }, classes, map, classTextToSelector);

  const cssText = styles.map((style, idx) => {
    let backgroundValue = ''
    let transitionValue = ''
    let borderValue = ''
    if (
      style['border-bottom-left-radius'] === style['border-radius']
      && style['border-bottom-right-radius'] === style['border-radius']
      && style['border-top-left-radius'] === style['border-radius']
      && style['border-top-right-radius'] === style['border-radius']
    ) {
      delete style['border-bottom-left-radius']
      delete style['border-bottom-right-radius']
      delete style['border-top-left-radius']
      delete style['border-top-right-radius']
    }
    if (
      style['border-top'] === style['border-right']
      && style['border-right'] === style['border-bottom']
      && style['border-bottom'] === style['border-left']
    ) {
      delete style['border-top']
      delete style['border-right']
      delete style['border-bottom']
      delete style['border-left']
    }
    if (
      style['overflow-x'] === style['overflow-y']
      && style['overflow-x'] === style['overflow']
    ) {
      delete style['overflow-x']
      delete style['overflow-y']
    }
    let cssText =
      Object.keys(style)
      .map(key => {
        const val = style[key]
        if (['border-style', 'border-width', 'border-color'].indexOf(key) > -1) {
          borderValue += val.trim() + ' '
          return
        } else if (/^background-/.test(key)) {
          backgroundValue += val.trim() + ' '
          return
        } else if (/^transition-/.test(key)) {
          transitionValue += val.trim() + ' '
          return
        }else if (key === 'background' || key === 'transition' || key === 'border') {
          return
        } else if ((style['position'] !== 'absolute' || style['position'] !== 'fixed') && ['top', 'right', 'bottom', 'left'].indexOf(key) > -1) {
          return
        } else {
          return `  ${key}: ${val};\n`
        }
      })
      .filter(t => t)
      .join('')
    if(backgroundValue !== '') {
      cssText += `  background: ${backgroundValue};\n`
    }
    if (transitionValue !== '') {
      cssText += `  transition: ${transitionValue};\n`
    }
    if (borderValue !== '') {
      cssText += `  border: ${borderValue};\n`
    }
    cssText = classTextToSelector(classes[idx]) + ' {\n' + cssText + '}'
    return cssText
  }).join('\n\n')

  fs.mkdirSync(path.join(cwd, output, './style-output'))
  fs.writeFileSync(path.join(cwd, output, './style-output/index.html'), generateTpl($.html(container) + ''))
  fs.writeFileSync(path.join(cwd, output, './style-output/index.css'), cssText)

  await browser.close()
}

module.exports = load
