import type { Root as HRoot } from 'hast';
import type { Root } from 'mdast';
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki';
import type { Processor } from 'unified';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import GithubSlugger from 'github-slugger';
import rehypeKatex from 'rehype-katex';
import rehypeMermaid from 'rehype-mermaid';
import rehypeRaw from 'rehype-raw';
import { rehypeVue } from 'rehype-vue';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { createHighlighter } from 'shiki';
import { unified } from 'unified';
import Anchor from './components/anchor.vue';
import CodeBlock from './components/code-block.vue';
import Header from './components/header.vue';
import List from './components/list.vue';
import Table from './components/table.vue';
import ToolCall from './components/tool-call.vue';
import {
  rehypeCommon,
} from './plugins';
import 'katex/dist/katex.min.css';

export type MarkdownProcessor = Processor<Root, Root, HRoot>;

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null;

let slugger: GithubSlugger | null = null;

export async function createMarkdownRenderer() {
  if (!highlighter) {
    // 创建不加载任何语言的 highlighter
    highlighter = await createHighlighter({
      themes: ['github-light'],
      langs: [], // 不预加载任何语言
    });
  }

  if (!slugger) {
    slugger = new GithubSlugger();
  }

  // 创建处理器
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw, {
      tagfilter: true,
    })
    .use(rehypeCommon, slugger)
    .use(rehypeKatex)
    .use(rehypeMermaid, {
      errorFallback: () => {},
    })
    .use(rehypeShikiFromHighlighter, highlighter, {
      theme: 'github-light',
      lazy: true,
      defaultLanguage: 'text',
      fallbackLanguage: 'text',
      addLanguageClass: true,
      transformers: [
        {
          pre(node) {
            node.properties.code = this.source;
            node.properties.lang = this.options.lang;
            return node;
          },
        },
      ],
    })
    .use(rehypeVue, {
      components: {
        'pre': CodeBlock,
        'a': Anchor,
        'h1': Header,
        'h2': Header,
        'h3': Header,
        'h4': Header,
        'h5': Header,
        'h6': Header,
        'table': Table,
        'ul': List,
        'ol': List,
        'use-tool': ToolCall,
      },
    });

  return { processor, slugger };
}

export function useMarkdownProcessor() {
  const processor = shallowRef<MarkdownProcessor | null>(null);
  const slugger = shallowRef<GithubSlugger | null>(null);

  createMarkdownRenderer().then((res) => {
    processor.value = res.processor;
    slugger.value = res.slugger;
  });

  return { processor, slugger };
}
