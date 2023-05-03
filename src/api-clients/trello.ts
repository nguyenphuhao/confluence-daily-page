import trelloAPI from '../common/trello';
const defaultListId = '6451fbf37248445542d2d75d';

export const getList = (idList?: string) => {
    const listId = idList || defaultListId;
    return trelloAPI(`1/lists/${listId}`, 'get');
}
type UpdateList = {
    name: string;
}
export const updateList = (params: UpdateList, idList?: string) => {
    const listId = idList || defaultListId;
    return trelloAPI(`1/lists/${listId}`, 'put', params);
}
export const getCardsInList = (idList?: string) => {
    const listId = idList || defaultListId;
    return trelloAPI(`1/lists/${listId}/cards`, 'get');
}

type CreateNewCardParams = {
    name: string;
    desc: string;
    idList?: string;
}
export const createNewCard = (params: CreateNewCardParams) => {
    const {
        name = 'Test',
        desc = 'Test',
        idList = defaultListId
    } = params;
    return trelloAPI(`1/cards`, 'post', {
        name,
        desc,
        idList
    });
}
