import moment from 'moment';
import confluenceAPI from '../common/confluence';
import { createNewCard, getList, updateList } from '../api-clients/trello';

class DailyPageService {
  async duplicate(parentPageId = '428310577', prefix?: string) {
    try {
      const confluence = confluenceAPI();
      const now = moment();
      const title = now.format('D MMM');
      const search = now.subtract(1, 'days').format('D MMM');

      const getCurrentSourcePageId = async () => {
        const res = await getList();
        return res?.data?.name;
      }
      const fromPageId = await getCurrentSourcePageId();
      const res = await confluence.post(`/wiki/rest/api/content/${fromPageId}/pagehierarchy/copy`, {
        "copyAttachments": true,
        "copyPermissions": true,
        "copyProperties": true,
        "copyLabels": true,
        "copyCustomContents": true,
        "copyDescendants": true,
        "destinationPageId": parentPageId,
        "titleOptions": {
          "prefix": prefix,
          "replace": title,
          "search": search
        }
      });
      const task = res.data;
      let counter = 0;
      let done = false;
      const intVal = setInterval(async () => {
        if (done) {
          return;
        }
        if (counter > 10) {
          clearInterval(intVal);
          return;
        }
        const result = await confluence.get(`/wiki/rest/api/longtask/${task.id}`);
        if (result?.data?.additionalDetails?.destinationUrl) {
          const detail = result.data.additionalDetails;
          await createNewCard({
            name: `${process.env.CONFLUENCE_HOST}/wiki${detail.destinationUrl}`,
            desc: detail.destinationId
          });
          const urlFragment = detail.destinationUrl.split('/');
          await updateList({
            name: urlFragment[urlFragment.length - 2]
          });
          done = true;
          clearInterval(intVal);
        }
      }, 30000);
      return 'OK';
    } catch (error) {
      throw error;
    }
  }
}
export default DailyPageService;