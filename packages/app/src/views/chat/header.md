<use-tool label="搜索内源项目">
<search-project-by-keyword>
<infer-project-name>内源贡献值</infer-project-name>
</search-project-by-keyword>
<result state="success">
[{"id":2,"name":"OpenX","introduction":"华为公司内源平台OpenX，是公司内源项目品牌的统一门户，是华为内源的官方网站，为内源项目和社区提供数字化运营支持，为内源项目和社区提供IT基础设施。"},{"id":0,"name":"非内源项目问题","introduction":"问题与内源、OpenX、内源平台、内源项目均无关联"}]
</result>
</use-tool>
<use-tool label="获取内源项目详情">
<get-project-info-by-id>
<project-id>2</project-id>
</get-project-info-by-id>
<result state="success">
{"id":2,"projectName":"OpenX","applicationFieldId":null,"applicationFieldName":null,"projectType":"内源优选项目","projectPrimaryOwnerNameCn":null,"projectPrimaryOwner":"c00436111","projectPrimaryOwnerName":"陈光镜","projectCoSponsor":"[{\"username\": \"张三\",\"employeeId\":\"swx857778\"},{\"username\": \"李四\",\"employeeId\":\"swx857778\"}]","projectIntroduction":"华为公司内源平台OpenX，是公司内源项目品牌的统一门户，是华为内源的官方网站，为内源项目和社区提供数字化运营支持，为内源项目和社区提供IT基础设施。","projectLanguage":"104","projectLogoUrl":"https://file.openx.huawei.com/openx-file/dfsfile/00/04/Chx5Kl9fXGKAV9_AAAAUeCKHhsk456.png","projectUserInfo":"公司全体研发人员","projectTarget":"华为内源基金会官网，供用户自由的协同合作，知识共享，发展创新，提升代码质量，从而提高产品研发效率，提升产品竞争力，创造自我价值，提升自我能力,华为内源基金会官网，供用户自由的协同合作，知识共享，发展创新，提升代码质量，从而提高产品研发效率，提升产品竞争力，创造自我价值，提升自我能力\r\n","projectInitiatingTime":"2020-07-03 19:33:20","projectCreateTime":null,"projectUpdateTime":"2025-09-11","projectCommunityId":32,"projectSize":"1258","projectDownloads":297,"projectVisits":77344,"projectUnrecordedVisits":15155,"projectSharingAmount":190,"projectFollowingAmount":1464,"projectCommentingAmount":58,"projectId":360869,"isGold":false,"projectOtherInfo":"Esapce群：353318656","reservedField1":"[{\"name\":\"Java\",\"languageId\":104}]","reservedField2":null,"reservedField3":null,"isUpgrade":1,"goldenPrizeYear":null,"vitalityPrizeYear":null,"vitalityPrizeQuarter":null,"newStarPrizeTime":null,"availableGradeName":"L2 可用级","availableGrade":2,"availableGradeColor":"#28a0ff","status":2,"isOwnerReadAuditBool":null,"isEmptyGit":0,"isPopular":null,"codehubUrl":"https://open.codehub.huawei.com/innersource/openx","createByAiCommunity":0,"commercialProject":1,"projectHomeCommunity":"华为内源技术社区","espaceLogoUrl":"https://w3.huawei.com/w3lab/rest/yellowpage/face/00436111/120","appFields":null,"isManager":true,"isCoach":false,"object":"软件工程","lang":"Java","dataUpdateTime":"2025-09-11","projectCommonZoneLink":null,"projectCoachVoList":[{"projectId":2,"employeeId":"j00411890","username":"姜宁","deptName":"可信理论、技术与工程实验室"}],"projectMaturityState":10,"projectFormalCommunityId":null,"finalScore":2.8,"projectGroupId":8117,"softwareForm":null,"softwareFormName":null,"labelList":[],"createGroupType":null,"createChatGroup":null,"createPmcGroup":null,"chatGroupID":null,"chatGroupName":null,"pmcGroupID":null,"pmcGroupName":null,"openxIsGitManager":1,"openCodehubApplicationId":0,"projectApplicationStatus":null,"isOperstion":false,"heroesNum":372,"latestVersion":"1.8.0","datasetIds":null,"modelIds":null,"modelList":[],"datasetList":[],"followed":true,"url":"https://openx.huawei.com/OpenX","welinkGroups":"353318656(内源项目Owner群),529697562(OpenX 内源平台用户交流群)","innerSourceGrade":73}
</result>
</use-tool>
<use-tool label="知识库查询">
<get-knowledge>
<project-id>2</project-id>
<query>内源贡献值</query>
</get-knowledge>
<result state="success">
<knowledge title="内源贡献值，该如何算呢？——决策稿" url="httpsopenxuawei.com/communityHome/postDetail?postId=2785&id=32" project-name="OpenX">

## 成长值（原内源贡献值）计算算法

### 关键更改
- **命名**：贡献值改称为“成长值”。
- **排名：取消排名，仅记录成长值。
- **与社区 Title 解耦**：成长值不再与社区 Title（如 committer、TCC member）关联。

### 计算起始时间
个人从其所在的内源项目在 OpenX 完成登记注册之日起累计成长值。

### 成长值算法细则

| 序号 | 用户操作类型 | 获得的积分 β_i（分） | 每日获取上限 M_i |
|------|--------------|----------------------|------------------|
| 1 | MR 提交的个数 | 5 | +∞ |
| 2 | MR 审核的个数 | 2 | +∞ |
| 3 | Commits 提交的次数 | 3 | +∞ |
| 4 | Issue 提交的个数 | 3 | +∞ |
| 5 | Issue 评论个数 | 2 | +∞ |
| 6 | Code Review 的个数 | 2 | +∞ |

**公式**

$$
\text{成长值 Growth Value } = \sum_{i=1}^{6} \min \left( \beta_i \times \#_i,\; M_i \right)
$$

其中，\#_i 为第 i 类操作的实际次数，β_i 为对应的积分系数，M_i 为该类操作的每日上限（若为 +∞ 则无上限）。

### 成长值对应的 IP 等级
（图示展示不同值区间对应的 IP 等级，详见原文图片）

</knowledge>
</result>
</use-tool>

内源贡献值现已更名为“成长值”，不再参与排名，也不再与社区 Title（如 committer、TCC member）关联。成长值从个人所在的内源项目在 OpenX 完成登记注册之日起开始累计。

### 成长值计算规则

成长值根据以下六类用户操作进行累计，每类操作的积分和每日获取上限如下：

| 序号 | 操作类型         | 积分（分/次） | 每日获取上限 |
|------|------------------|---------------|--------------|
| 1    | MR 提交个数       | 5             | 无上限        |
| 2    | MR 审核个数       | 2             | 无上限        |
| 3    | Commits 提交次数  | 3             | 无上限        |
| 4    | Issue 提交个数    | 3             | 无上限        |
| 5    | Issue 评论个数    | 2             | 无上限        |
| 6    | Code Review 个数  | 2             | 无上限        |

| 序号 | 操作类型         | 积分（分/次） | 每日获取上限 |
|------|------------------|---------------|--------------|
| 1    | MR 提交个数       | 5             | 无上限        |
| 2    | MR 审核个数       | 2             | 无上限        |
| 3    | Commits 提交次数  | 3             | 无上限        |
| 4    | Issue 提交个数    | 3             | 无上限        |
| 5    | Issue 评论个数    | 2             | 无上限        |
| 6    | Code Review 个数  | 2             | 无上限        |

| 序号 | 操作类型         | 积分（分/次） | 每日获取上限 |
|------|------------------|---------------|--------------|
| 1    | MR 提交个数       | 5             | 无上限        |
| 2    | MR 审核个数       | 2             | 无上限        |
| 3    | Commits 提交次数  | 3             | 无上限        |
| 4    | Issue 提交个数    | 3             | 无上限        |
| 5    | Issue 评论个数    | 2             | 无上限        |
| 6    | Code Review 个数  | 2             | 无上限        |

**计算公式**：

$$
\text{成长值} = \sum_{i=1}^{6} \min(\beta_i \times \#_i, M_i)
$$

其中：
- $\beta_i$：第 $i$ 类操作的积分系数
- $\#_i$：第 $i$ 类操作的实际次数
- $M_i$：第 $i$ 类操作的每日获取上限（此处均为无上限）

更多信息可参考 [内源贡献值，该如何算呢？——决策稿](https://openx.huawei.com/communityHome/postDetail?postId=2785&id=32)
