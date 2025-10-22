import { Buffer } from 'node:buffer';
import { Readability } from '@mozilla/readability';
import { Injectable } from '@nestjs/common';
import html2md from 'html-to-md';
import { JSDOM } from 'jsdom';
import {
  getActivityDetail,
  getCommunityById,
  getCommunityEspaceGroups,
  getCommunityPostDetail,
  getDynamicDetail,
  getProjectById,
  getProjectDetail,
  getProjectEspaceGroups,
  getProjectInnerSourceGrade,
  getProjectReadme,
  searchFromW3,
  searchFromWebsite,
} from '../api/openx';
import { request } from '../api/request/common';
import {
  htmlEncode,
  OPENX_WEBSITE_DOMAIN,
  OPENX_WEBSITE_URL,
  removeHighlight,
  strSimilarity,
} from '../utils';
import { resolveBelongingDataProps } from './data-map';
import {
  GetBelongingDataDto,
  SearchDetailItem,
  TransformDto,
} from './dto';

@Injectable()
export class ChatbotService {
  async getBelongingData(dto: GetBelongingDataDto) {
    let info: Record<string, any>[] = [];
    let type: string = 'project';
    let id: number = 2;

    try {
      const res = await this.resolveInferBelonging(dto);
      type = res.type || type;
      id = res.id || id;

      if (type === 'community') {
        info = await this.resolveCommunity(id);
      }
      else if (type === 'project') {
        info = await this.resolveProject(id);
      }
    }
    catch (e) {
      console.error(e);
    }

    return {
      type,
      id,
      info,
    };
  }

  async resolveProject(id: number) {
    const res = await getProjectById(id);

    const [projectDetail, groups, grades] = await Promise.all([
      getProjectDetail(res.projectName),
      getProjectEspaceGroups(res.id),
      getProjectInnerSourceGrade(res.id),
    ]);

    projectDetail.url = `${OPENX_WEBSITE_URL}/${projectDetail.projectName}`;
    projectDetail.lang = (projectDetail.lang || []).join(',');
    projectDetail.object = (projectDetail.object || []).map(o => o.NAME).join(',');
    projectDetail.welinkGroups = groups.map(g => `${g.group_id}(${g.group_name})`).join(',');
    projectDetail.innerSourceGrade = grades?.innerSourceGrade || 0;
    return resolveBelongingDataProps('project', projectDetail);
  }

  async resolveCommunity(id: number) {
    const [communityDetail, groups] = await Promise.all([
      getCommunityById(id),
      getCommunityEspaceGroups(id),
    ]);

    communityDetail.url = `${OPENX_WEBSITE_URL}/communityHome?id=${communityDetail.id}`;
    communityDetail.welinkGroups = groups.map(g => `${g.group_id}(${g.group_name})`).join(',');
    return resolveBelongingDataProps('community', communityDetail);
  }

  async resolveInferBelonging(dto: GetBelongingDataDto): Promise<Omit<GetBelongingDataDto, 'inferName'>> {
    const {
      type,
      id,
      inferName,
    } = dto;

    if (!inferName) {
      return { type, id };
    }

    const [pRes, cRes] = await Promise.all([
      searchFromWebsite({
        words: inferName,
        pageNum: 1,
        pageSize: 10,
        type: 'project',
        sortType: '',
      }),
      searchFromWebsite({
        words: inferName,
        pageNum: 1,
        pageSize: 10,
        type: 'community',
        sortType: '',
      }),
    ]);

    const targetProject = pRes.result?.info?.[0];
    const targetCommunity = cRes.result?.info?.[0];

    if (!targetProject && !targetCommunity) {
      return { type, id };
    }

    const projectName = targetProject?.name || '';
    const projectSimilarity = projectName ?
        strSimilarity(
          inferName.toLocaleLowerCase(),
          projectName.toLocaleLowerCase(),
        ) :
      0;

    const communityName = targetCommunity?.communityName || '';
    const communitySimilarity = communityName ?
        strSimilarity(
          inferName.toLocaleLowerCase(),
          communityName.toLocaleLowerCase(),
        ) :
      0;

    if (targetProject && projectSimilarity >= communitySimilarity) {
      return {
        type: 'project',
        id: targetProject.projectId,
      };
    }

    if (targetCommunity && communitySimilarity >= projectSimilarity) {
      return {
        type: 'community',
        id: targetCommunity.id,
      };
    }

    return { type, id };
  }

  async search(query: string, turn: number = 1, maxLength: number = 300) {
    try {
      // 少于两个字符，无搜索结果
      if (query.length < 2) {
        return [];
      }

      const results: SearchDetailItem[] = [];

      for (let i = 0; i < turn; i++) {
        const res = await searchFromW3({
          searchTxt: query,
          pageIndex: i + 1,
        });
        results.push(...res?.data.map((item) => {
          return {
            title: removeHighlight(item.DOC_TITLE),
            url: item.DOC_URL,
            content: removeHighlight(item.HIGHLIGHT.join('')).slice(0, maxLength),
          };
        }) || []);
      }

      return results;
    }
    catch (e) {
      console.error(e);
      return [];
    }
  }

  async getSearchDetail(item: SearchDetailItem) {
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

  async transform(dto: TransformDto) {
    const { type, contentType, content } = dto;
    if (contentType === 'markdown') {
      return content;
    }

    if (type === 'wiki') {
      // HTML 内容需要转换成 markdown 处理
      const { window } = new JSDOM(content);
      const { document } = window;

      // 处理 wiki 特色代码块
      const editorCode = document.querySelectorAll<HTMLElement>('ce-monaco-code-editor');
      Array.from(editorCode).forEach((block) => {
        const lang = block.getAttribute('language') || 'bash';

        let code = block.getAttribute('code');
        code = Buffer.from(String(code), 'base64').toString('utf-8');
        const codeHtml = code.split('\n')
          .map(line => `<div>${htmlEncode(line)}</div>`)
          .join('');

        const preEl = document.createElement('pre');
        const codeEl = document.createElement('code');
        codeEl.setAttribute('class', `language-${lang}`);
        codeEl.innerHTML = codeHtml;
        preEl.appendChild(codeEl);

        block.parentNode?.replaceChild(preEl, block);
      });

      return html2md(document.body.innerHTML);
    }
    else if (type === 'post' || type === 'dynamic') {
      const { window } = new JSDOM(content);
      const { document } = window;
      return html2md(document.body.innerHTML);
    }

    return content;
  }
}

function getContentFromHtml(html: string) {
  const { window } = new JSDOM(html);
  const { document } = window;
  const reader = new Readability(document);
  const article = reader.parse();
  return html2md(article?.content || '');
}
