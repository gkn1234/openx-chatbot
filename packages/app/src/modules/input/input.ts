import type { Ref } from 'vue';
import type { ChatApp } from '../chat-app';
import type { ChatInputEvents, InputSkillOptions } from './types';
import { EventEmitter } from '../utils';

export class ChatAppInput extends EventEmitter<ChatInputEvents> {
  app: ChatApp;

  constructor(app: ChatApp) {
    super();
    this.app = app;

    const skillSelectionRes = this._useSkillSelection();
    this.skillSelectionWidth = skillSelectionRes.skillSelectionWidth;

    this._useSkillActive();
  }

  private _skills = reactive<InputSkillOptions[]>([]);

  /** 渲染可见的技能列表 */
  skills = computed(() => this._skills.filter(skill => !skill.hidden));

  /** 关键词过滤后的技能列表 */
  skillsFiltered = computed(() => this.skills.value.filter((skill) => {
    if (!this.skillSelectionQuery.value) {
      return true;
    }
    return skill.name.includes(this.skillSelectionQuery.value) || skill.description?.includes(this.skillSelectionQuery.value);
  }));

  addSkill(skill: InputSkillOptions) {
    const existedSkill = this._skills.find(s => s.key === skill.key);
    if (existedSkill) {
      return this;
    }

    this._skills.push(skill);
    return this;
  }

  removeSkill(key: string) {
    const index = this._skills.findIndex(skill => skill.key === key);
    if (index < 0) {
      return this;
    }

    this._skills.splice(index, 1);
    return this;
  }

  setSkill(key: string, options: Partial<Omit<InputSkillOptions, 'key'>>) {
    const skill = this._skills.find(s => s.key === key);
    if (!skill) {
      return this;
    }

    Object.assign(skill, options);
    return this;
  }

  /** 文字输入框 */
  query = ref('');

  /** 参数对象 */
  params = ref<Record<string, any>>({
    think: false,
    search: true,
    belongingType: 'project',
    belongingId: 2,
    belongingName: '',
    belongingLogo: '',
  });

  /** 是否展示技能选项框 */
  skillsSelectionVisible = ref(false);

  /** 输入容器的引用 */
  inputWrapperEl = ref<HTMLElement>();

  /** 技能选项框宽度与输入容器的宽度同步 */
  skillSelectionWidth: Ref<number>;

  /** 技能搜索输入框 */
  skillSelectionQuery = ref('');

  private _useSkillSelection() {
    const { width } = useElementSize(
      this.inputWrapperEl,
      { width: 0, height: 0 },
      { box: 'border-box' },
    );

    watch(this.query, (val, oldVal) => {
      if (oldVal === '' && val === '@') {
        this.query.value = '';
        this.emit('onShowSkillSelection');
      }
    });

    return {
      skillSelectionWidth: width,
    };
  }

  /** 被激活技能的 key */
  activeKey = ref('');

  /** 被激活的技能 */
  activeSkill = computed(() => this._skills.find(skill => skill.key === this.activeKey.value));

  /** 操作栏左侧的组件 */
  leftOperations = shallowRef<Component | null>(null);

  /** 操作栏右侧的组件 */
  rightOperations = shallowRef<Component | null>(null);

  private _useSkillActive() {
    watch(this.activeSkill, (skill) => {
      const leftOperations = skill?.leftOperations;
      if (leftOperations) {
        leftOperations().then((res) => {
          this.leftOperations.value = res;
        });
      }
      else {
        this.leftOperations.value = null;
      }

      const rightOperations = skill?.rightOperations;
      if (rightOperations) {
        rightOperations().then((res) => {
          this.rightOperations.value = res;
        });
      }
      else {
        this.rightOperations.value = null;
      }
    });
  }

  triggerSkill(key: string, type?: 'home' | 'chat', ...args: any[]) {
    const skill = this._skills.find(s => s.key === key);
    if (!skill) {
      return;
    }

    const isHome = type === 'home' || this.app.isHome.value;

    if (isHome) {
      skill.createTrigger?.(...args);
    }
    else {
      skill.chattingTrigger?.(...args);
    }
  }

  sendChatMessage(query: string = '') {
    const skill = this._skills.find(s => s.key === this.activeKey.value);
    if (!skill) {
      return;
    }

    const queryTxt = query || this.query.value.trim();

    if (!queryTxt) {
      return;
    }

    if (this.app.isHome.value) {
      skill.createSendMessage?.(queryTxt);
    }
    else if (this.app.isChat.value) {
      skill.chattingSendMessage?.(queryTxt);
    }

    this.query.value = '';
  }
}
