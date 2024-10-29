import {getProjects} from './index';
import '@logseq/libs';
import fetchMock from 'jest-fetch-mock';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

fetchMock.enableMocks();
fetchMock.dontMock();

beforeEach(() => {
    jest.spyOn(logseq, 'settings', 'get').mockReturnValue({
        username: process.env.TEAMCITY_USER,
        password: process.env.TEAMCITY_PASSWORD,
        host: process.env.TEAMCITY_HOST,
        disabled: false,
    });
});

afterAll(() => {
    global.fetch = undefined;
});

describe('getProjects', () => {
    it('should fetch projects successfully', async () => {
        const mockResponse = [{id: 'project1'}, {id: 'project2'}];
        const projects = await getProjects();
        expect(projects).toEqual(mockResponse);
    });
});
