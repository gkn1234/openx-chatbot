/** 从 html 字符串中获取第一张图片的 url */
export function firstImgFromHtml(html: string) {
  const match = html.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/i);
  return match ? match[1] : '';
}

/** 去除字符串中的 html 内容 */
export function htmlToString(htmlStr: string) {
  const tempStr = htmlStr || '';
  let str = tempStr
    .replace(/<\/?.+?\/?>/g, ' ')
    .replace(/\s/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/&middot;/gi, '')
    .replace(/&quot;/gi, '"')
    .replace(/::: hljs-center | ::: hljs-right | ::: hljs-left/gi, '')
    .replace(/:::/g, '')
    .replace(/==/g, '')
    .replace(/\^/g, '')
    .replace(/\[TOC\]/gi, '');
  if (!str.trim())
    str = '';

  return str;
}

export {
  escape,
  unescape,
} from 'lodash-es';
