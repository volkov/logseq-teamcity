import {getBuild, getProjects, parseBuildFromUrl} from './index';
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

describe('getBuild', () => {
    it('should fetch successful build', async () => {
        const build = await getBuild('139117');
        expect(build.status).toEqual('SUCCESS');
    });

    it('should fetch unsuccessful build', async () => {
        const build = await getBuild('139121');
        expect(build.status).toEqual('FAILURE');
    });
});

describe('parseBuildIdFromUrl', () => {
    it('should parse the build ID from the URL correctly', () => {
        const url = 'https://host/buildConfiguration/configname/139117?hideTestsFromDependencies=false&hideProblemsFromDependencies=false&expandBuildDeploymentsSection=false&pluginCoverage=true&expandBuildChangesSection=true';
        const build = parseBuildFromUrl(url);
        expect(build.id).toEqual('139117');
        expect(build.name).toEqual('configname');
    });
});
