const PROJECT_DATA_MAP: Record<string, string> = {
  projectName: '项目名称',
  projectIntroduction: '介绍信息',
  projectType: '分类',
  url: '访问地址',
  codehubUrl: '代码仓地址',
  innerSourceGrade: '内源指数',
  projectInitiatingTime: '创建时间',
  projectPrimaryOwner: '负责人(Owner)工号',
  projectPrimaryOwnerName: '负责人(Owner)姓名',
  projectHomeCommunity: '所属社区',
  projectFollowingAmount: '关注数量',
  projectDownloads: '下载数量',
  projectSharingAmount: '分享数量',
  projectVisits: '浏览数量',
  lang: '编程语言',
  object: '所属领域',
  welinkGroups: 'Welink交流帮助群',
};

const COMMUNITY_DATA_MAP: Record<string, string> = {
  communityName: '社区名称',
  communityDesc: '介绍信息',
  createTime: '创建时间',
  url: '访问地址',
  communityOwnerId: '负责人(Owner)工号',
  communityOwner: '负责人(Owner)姓名',
  communityViews: '浏览数量',
  communityMemberAmount: '成员数量',
  bulletinNum: '帖子数量',
  welinkGroups: 'Welink交流帮助群',
};

export function resolveBelongingDataProps(type: 'project' | 'community', data: Record<string, any>) {
  const map = type === 'project' ? PROJECT_DATA_MAP : COMMUNITY_DATA_MAP;
  const result: Array<{ label: string, value: any }> = [];
  for (const key in data) {
    if (map[key]) {
      result.push({
        label: map[key],
        value: data[key],
      });
    }
  }
  return result;
}
