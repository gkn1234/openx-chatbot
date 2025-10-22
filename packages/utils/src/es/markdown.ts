/** 从 markdown 字符串中获取第一张图片的 url */
export function firstImgFromMd(md: string) {
  const match = md.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : '';
}

interface MdToStringOptions {
  listUnicodeChar?: boolean
  stripListLeaders?: boolean
  gfm?: boolean
  useImgAltText?: boolean
  abbr?: boolean
  replaceLinksWithURL?: boolean
  htmlTagsToSkip?: string[]
}

/**
 * 去除字符串中的 markdown 内容。轻量，无需引入其他 md 依赖
 *
 * 来自：https://github.com/stiang/remove-markdown/blob/main/index.js
 */
export function mdToString(md: string, op?: MdToStringOptions) {
  const options: Required<MdToStringOptions> = {
    listUnicodeChar: false,
    stripListLeaders: true,
    gfm: true,
    useImgAltText: true,
    abbr: false,
    replaceLinksWithURL: false,
    htmlTagsToSkip: [],
    ...op,
  };
  let output = md || '';

  // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}/gm, '');

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar)
        output = output.replace(/^(\s*)([*\-+]|\d+\.)\s+/gm, `${options.listUnicodeChar} $1`);
      else
        output = output.replace(/^(\s*)([*\-+]|\d+\.)\s+/gm, '$1');
    }
    if (options.gfm) {
      output = output
      // Header
        .replace(/\n={2,}/g, '\n')
        // Fenced codeblocks
        .replace(/~{3}.*\n/g, '')
        // Strikethrough
        .replace(/~~/g, '')
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, '');
    }
    if (options.abbr) {
      // Remove abbreviations
      output = output.replace(/\*\[.*\]:.*\n/, '');
    }
    output = output
    // Remove HTML tags
      .replace(/<[^>]*>/g, '');

    let htmlReplaceRegex = /<[^>]*>/g;
    if (options.htmlTagsToSkip.length > 0) {
      // Using negative lookahead. Eg. (?!sup|sub) will not match 'sup' and 'sub' tags.
      const joinedHtmlTagsToSkip = `(?!${options.htmlTagsToSkip.join('|')})`;

      // Adding the lookahead literal with the default regex for html. Eg./<(?!sup|sub)[^>]*>/ig
      htmlReplaceRegex = new RegExp(
        `<${
          joinedHtmlTagsToSkip
        }[^>]*>`,
        'gi',
      );
    }

    output = output
      // Remove HTML tags
      .replace(htmlReplaceRegex, '')
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, '')
      // Remove footnotes?
      .replace(/\[\^.+?\](: .*$)?/g, '')
      .replace(/\s{0,2}\[.*?\]: .*$/g, '')
      // Remove images
      .replace(/!\[(.*?)\][[(].*?[\])]/g, options.useImgAltText ? '$1' : '')
      // Remove inline links
      .replace(/\[([^\]]*)\][[(].*?[\])]/g, options.replaceLinksWithURL ? '$2' : '$1')
      // Remove blockquotes
      .replace(/^(\n)?\s{0,3}>\s?/gm, '$1')
      // .replace(/(^|\n)\s{0,3}>\s?/g, '\n\n')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(/^(\n)?\s*#{1,6}\s*( (.+))? +#+$|^(\n)?\s*#{1,6}\s*( (.+))?$/gm, '$1$3$4$6')
      // Remove * emphasis
      .replace(/(\*+)(\S)(.*?\S)??\1/g, '$2$3')
      // Remove _ emphasis. Unlike *, _ emphasis gets rendered only if
      //   1. Either there is a whitespace character before opening _ and after closing _.
      //   2. Or _ is at the start/end of the string.
      .replace(/(^|\W)(_+)(\S)(.*?\S)??\2($|\W)/g, '$1$3$4$5')
      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/g, '$2')
      // Remove inline code
      .replace(/`(.+?)`/g, '$1')
      // // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      // .replace(/\n{2,}/g, '\n\n')
      // // Remove newlines in a paragraph
      // .replace(/(\S+)\n\s*(\S+)/g, '$1 $2')
      // Replace strike through
      .replace(/~(.*?)~/g, '$1');
  }
  catch (e) {
    console.error(e);
    return md;
  }
  return output;
}
