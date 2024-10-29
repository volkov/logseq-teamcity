import {getProjects} from './index';
import '@logseq/libs';

beforeEach(() => {
    jest.spyOn(logseq, 'settings', 'get').mockReturnValue({
        username: 'mockUsername',
        password: 'mockPassword',
        host: 'mockHost',
        disabled: false,
    });
});

describe('getProjects', () => {
    it('should fetch projects successfully', async () => {
        const mockResponse = [{id: 'project1'}, {id: 'project2'}];
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            })
        ) as jest.Mock;

        const projects = await getProjects();
        expect(projects).toEqual(mockResponse);
    });

    it('should throw an error if the network response is not ok', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: 'Not Found',
            })
        ) as jest.Mock;

        await expect(getProjects()).rejects.toThrow('Network response was not ok Not Found');
    });
});
