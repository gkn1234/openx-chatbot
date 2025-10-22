import type GithubSlugger from 'github-slugger';
import type { Element, Root } from 'hast';
import type { Plugin, Transformer } from 'unified';
import { toHtml } from 'hast-util-to-html';
import { toString } from 'hast-util-to-string';
import { visit } from 'unist-util-visit';

/**
 * 标题级别提取插件 - 将所有标题元素的级别信息添加到 properties 中
 */
export const rehypeCommon: Plugin<[GithubSlugger], Root> = (slugger) => {
  const { isHeader, resolveHeader } = useHeader(slugger);
  const { isList, resolveList } = useList();
  const { isToolCall, resolveToolCall } = useToolCall();

  const transformer: Transformer<Root> = (tree) => {
    // 遍历所有元素节点
    visit(tree, 'element', (node) => {
      if (isHeader(node)) {
        resolveHeader(node);
      }
      else if (isList(node)) {
        resolveList(node);
      }
      else if (isToolCall(node)) {
        resolveToolCall(node);
      }
    });

    return tree;
  };

  return transformer;
};

function useHeader(slugger: GithubSlugger) {
  function isHeader(node: Element) {
    return /^h[1-6]$/i.test(node.tagName);
  }

  function resolveHeader(node: Element) {
    const level = Number(node.tagName.charAt(1));
    node.properties.level = level;

    const text = toString(node);
    const slug = slugger.slug(text);
    node.properties.id = slug;
  }

  return {
    isHeader,
    resolveHeader,
  };
}

function useList() {
  function isList(node: Element) {
    return node.tagName.toLocaleLowerCase() === 'ul' || node.tagName.toLocaleLowerCase() === 'ol';
  }

  function resolveList(node: Element) {
    const isOl = node.tagName.toLocaleLowerCase() === 'ol';
    node.properties.isOl = isOl;
  }

  return {
    isList,
    resolveList,
  };
}

function useToolCall() {
  function isToolCall(node: Element) {
    return node.tagName.toLocaleLowerCase() === 'use-tool';
  }

  function resolveToolCall(node: Element) {
    const [tool, result] = node.children.filter(item => item.type === 'element');
    node.properties.name = tool?.tagName || '';
    node.properties.resultState = result?.properties.state || 'running';
    node.properties.resultContent = result ? toHtml(result.children) : '';

    const params = tool?.children.filter(item => item.type === 'element') || [];
    const paramsObj: Record<string, any> = {};
    params.forEach((p) => {
      const key = p.tagName;
      const value = toHtml(p.children);
      paramsObj[key] = value;
    });
    node.properties.params = paramsObj as any;

    node.children = [];
  }

  return {
    isToolCall,
    resolveToolCall,
  };
}
