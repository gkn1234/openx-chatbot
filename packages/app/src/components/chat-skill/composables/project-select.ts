import type ChatSkillsOperationButton from '../chat-skills-operation-button.vue';
import type ChatSkillsOperationMenuItem from '../chat-skills-operation-menu-item.vue';
import { useApi } from '@app/api';
import { ChatApp } from '@app/modules';
import { debounce } from 'lodash-es';

export interface ProjectInfo {
  id: number
  logo: string
  name: string
  invalid?: boolean
}

const projectCache: Record<number, ProjectInfo> = {};

const projectSelectSymbol = Symbol('project-select') as InjectionKey<ProjectSelectContext>;

export function setupProjectSelect() {
  const { main, open } = useApi();
  const app = ChatApp.use();
  const { params } = app.input;

  async function getProjectInfo(id: number) {
    if (projectCache[id]) {
      return projectCache[id];
    }

    await main.get('/project/query/project-detail/{id}', {
      path: { id },
    }).then((res) => {
      projectCache[id] = {
        id,
        logo: res.projectLogoUrl,
        name: res.projectName,
      };
    }).catch(() => {
      projectCache[id] = {
        id,
        logo: '',
        name: '无效项目',
        invalid: true,
      };
    });

    return projectCache[id];
  }

  function setProjectInfo(info: ProjectInfo) {
    projectCache[info.id] = info;
  }

  const query = ref('');
  const projectList = ref<ProjectInfo[]>([]);
  const isProjectAvailable = ref(false);

  watch(() => params.value.belongingId, (id) => {
    getProjectInfo(id).then((res) => {
      params.value.belongingLogo = res.logo;
      params.value.belongingName = res.name;
      isProjectAvailable.value = !res.invalid;
    });
  }, { immediate: true });

  watch(query, debounce((val) => {
    if (!val) {
      projectList.value = Object.values(projectCache);
      return;
    }

    open.get('/os/project/question/search/projectName', {
      query: { key: val, size: 99 },
    }).then((res) => {
      projectList.value = res.map(item => ({
        id: item.id,
        logo: item.projectLogoUrl,
        name: item.projectName,
      }));
    });
  }, 300));

  function projectSelectHandler(item: ProjectInfo) {
    setProjectInfo(item);
    params.value.belongingId = item.id;
    hidePopper();
    query.value = '';
  }

  const buttonRef = ref<InstanceType<typeof ChatSkillsOperationButton>>();
  const menuItemRef = ref<InstanceType<typeof ChatSkillsOperationMenuItem>>();

  function hidePopper() {
    buttonRef.value?.hidePopover();
    menuItemRef.value?.hidePopover();
  }

  const result = {
    params,
    query,
    projectList,
    isProjectAvailable,
    buttonRef,
    menuItemRef,
    getProjectInfo,
    setProjectInfo,
    projectSelectHandler,
  };

  provide(projectSelectSymbol, result);

  return result;
}

export type ProjectSelectContext = ReturnType<typeof setupProjectSelect>;

export function useProjectSelect() {
  const res = inject(projectSelectSymbol);
  if (!res) {
    throw new Error('ProjectSelectContext not found');
  }
  return res;
}
