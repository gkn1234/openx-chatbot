import type { ChatApp } from '../../../modules';
import {
  askOpenxNewSkill,
  askOpenxSkill,
  askProjectSkill,
  issueReportSkill,
  setOpenxSkill,
  webDescriptionSkill,
  welinkDescriptionSkill,
} from '../skills';

export function useChatSkillsPreset(app: ChatApp) {
  app.input
    .addSkill(askOpenxSkill(app))
    .addSkill(askProjectSkill(app))
    .addSkill(askOpenxNewSkill(app))
    .addSkill(issueReportSkill(app))
    .addSkill(webDescriptionSkill(app))
    .addSkill(welinkDescriptionSkill(app));

  setOpenxSkill(app);
}
