import type { ChatApp } from '../../../modules';
import {
  askOpenxSkill,
  askProjectSkill,
  deepSearchSkill,
  issueReportSkill,
  setDeepSearchSkill,
  setOpenxSkill,
  webDescriptionSkill,
  welinkDescriptionSkill,
} from '../skills';

export function useChatSkillsPreset(app: ChatApp) {
  app.input
    .addSkill(deepSearchSkill(app));

  /*
  app.addSkill(askOpenxSkill(app))
    .addSkill(askProjectSkill(app))
    .addSkill(issueReportSkill(app))
    .addSkill(webDescriptionSkill(app))
    .addSkill(welinkDescriptionSkill(app));
  */

  setDeepSearchSkill(app);
}
