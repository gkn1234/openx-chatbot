import type { AgentBase, AgentRequestContext } from '../modules';
import { Readability } from '@mozilla/readability';
import html2md from 'html-to-md';
import { JSDOM } from 'jsdom';
import {
  getActivityDetail,
  getCommunityPostDetail,
  getDynamicDetail,
  getProjectReadme,
  searchFromW3,
} from '../../api/openx';
import { request } from '../../api/request/common';
import {
  OPENX_WEBSITE_DOMAIN,
  removeHighlight,
} from '../../utils';
import { AgentTool } from '../modules';

export interface W3SearchDetailItem {
  title: string

  url: string

  content: string
}

export function w3SearchTool(agent: AgentBase) {
  return new AgentTool(agent, {
    name: 'w3-search',
    label: 'W3 搜索',
    description: `给定关键字，联网搜索，通过 W3 搜索获取与提问相关的更多信息。

可以在一次请求中使用多个关键字，关键字之间以空格分隔。
`,
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: '搜索关键字，不得少于 2 字符',
        briefDescription: '搜索关键字',
        required: true,
      },
    ],
    handler: async (params, context) => {
      const res = await w3Search(params.query, agent, context);
      return {
        state: 'success',
        result: res,
        reason: '',
        output: false,
      };
    },
  });
}

const SEARCH_TURN = 3;
const MAX_LENGTH = 1000;

/**
 * w3 搜索
 * @param keyword 搜索关键字
 * @param agent
 * @param context
 * @returns 搜索结果
 */
async function w3Search(
  keyword: string,
  agent: AgentBase,
  context: AgentRequestContext,
) {
  // 少于两个字符，无搜索结果
  if (keyword.length < 2) {
    return '';
  }

  const results: W3SearchDetailItem[] = [];
  const resultMap: Record<string, W3SearchDetailItem> = {};

  // 搜索出 30 条数据
  for (let i = 0; i < SEARCH_TURN; i++) {
    const res = await searchFromW3({
      searchTxt: keyword,
      pageIndex: i + 1,
    });

    for (let j = 0; j < res?.data.length || 0; j++) {
      const item = res.data[j];
      if (resultMap[item.DOC_URL]) {
        const data = resultMap[item.DOC_URL];
        data.content += `\n${removeHighlight(item.HIGHLIGHT.join(''))}`;
        data.content = data.content.slice(0, MAX_LENGTH);
        continue;
      }

      const data = {
        title: removeHighlight(item.DOC_TITLE),
        url: item.DOC_URL,
        content: removeHighlight(item.HIGHLIGHT.join('')).slice(0, MAX_LENGTH),
      };
      resultMap[item.DOC_URL] = data;
      results.push(data);
    }
  }

  // 去重过滤，获取详情
  const promises: Promise<void>[] = [];
  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    promises.push(getSearchDetail(item));
  }
  await Promise.all(promises);

  // 调用 w3 搜索 Agent 处理搜索结果
  const w3Context = await agent.service.blockRequest({
    user: context.userId,
    name: 'w3-search',
    query: context.query,
    response_mode: 'blocking',
    title: '工具调用：w3-search',
    type: 'sub',
    inputs: {
      rawSearchResult: results,
    },
  }, context);

  return w3Context.finalResult;
}

async function getSearchDetail(item: W3SearchDetailItem) {
  const projectReg = new RegExp(`${OPENX_WEBSITE_DOMAIN}/projectHome\\?projectId=(\\d+)&`);
  const projectMatch = item.url.match(projectReg);
  if (projectMatch) {
    const projectId = projectMatch[1];
    try {
      const res = await getProjectReadme(projectId);
      item.content = res.readmeContent || item.content;
      return;
    }
    catch (e) {
      console.error(e);
      return;
    }
  }

  const postReg = new RegExp(`${OPENX_WEBSITE_DOMAIN}/communityHome/postDetail\\?postId=(\\d+)&id=(\\d+)&`);
  const postMatch = item.url.match(postReg);
  if (postMatch) {
    const [, postId, communityId] = postMatch;
    try {
      const { bulletinContent, editorType } = await getCommunityPostDetail({
        id: postId,
        communityId,
      });
      const md = editorType === 2 ? html2md(bulletinContent) : bulletinContent;
      item.content = md || item.content;
      return;
    }
    catch (e) {
      console.error(e);
      return;
    }
  }

  const dynamicReg = new RegExp(`${OPENX_WEBSITE_DOMAIN}/(.+?)/dynamics/(\\d+)`);
  const dynamicMatch = item.url.match(dynamicReg);
  if (dynamicMatch) {
    const [,, dynamicId] = dynamicMatch;
    try {
      const { bulletinContent, editorType } = await getDynamicDetail(dynamicId);
      const md = editorType === 2 ? html2md(bulletinContent) : bulletinContent;
      item.content = md || item.content;
      return;
    }
    catch (e) {
      console.error(e);
      return;
    }
  }

  const activityReg = new RegExp(`${OPENX_WEBSITE_DOMAIN}/activityZone/activityDetail\\?activityId=(\\d+)&`);
  const activityMatch = item.url.match(activityReg);
  if (activityMatch) {
    const activityId = activityMatch[1];
    try {
      const { details, detailType } = await getActivityDetail(activityId);
      const md = detailType === 2 ? html2md(details) : details;
      item.content = md || item.content;
      return;
    }
    catch (e) {
      console.error(e);
      return;
    }
  }

  // 爬虫处理
  try {
    const res = await request({
      url: item.url,
      method: 'GET',
    });
    const html = res.data;
    const mdResolved = getContentFromHtml(html);
    item.content = mdResolved || item.content;
  }
  catch (e) {
    console.error(e);
  }
}

function getContentFromHtml(html: string) {
  const { window } = new JSDOM(html);
  const { document } = window;
  const reader = new Readability(document);
  const article = reader.parse();
  return html2md(article?.content || '');
}
