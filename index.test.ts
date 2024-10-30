import {extractUrlFromString, getBuild, getProjects, parseBuildFromUrl} from './index';
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

describe('extractUrlFromString', () => {
    it('should extract URL from a string with URL in parentheses', () => {
        const input = "[BackendBuild #139117](https://serg-v.teamcity.com/buildConfiguration/BackendBuild/139117?hideTestsFromDependencies=false&hideProblemsFromDependencies=false&expandBuildDeploymentsSection=false&pluginCoverage=true&expandBuildChangesSection=true) - SUCCESS";
        const expected = "https://serg-v.teamcity.com/buildConfiguration/BackendBuild/139117?hideTestsFromDependencies=false&hideProblemsFromDependencies=false&expandBuildDeploymentsSection=false&pluginCoverage=true&expandBuildChangesSection=true";
        expect(extractUrlFromString(input)).toEqual(expected);
    });

    it('should extract URL from a string containing only the URL', () => {
        const input = "https://serg-v.teamcity.com/buildConfiguration/BackendBuild/139117?hideTestsFromDependencies=false&hideProblemsFromDependencies=false&expandBuildDeploymentsSection=false&pluginCoverage=true&expandBuildChangesSection=true";
        const expected = "https://serg-v.teamcity.com/buildConfiguration/BackendBuild/139117?hideTestsFromDependencies=false&hideProblemsFromDependencies=false&expandBuildDeploymentsSection=false&pluginCoverage=true&expandBuildChangesSection=true";
        expect(extractUrlFromString(input)).toEqual(expected);
    });

    it('should extract URL from untrimmed string', () => {
        const input = "  https://serg-v.teamcity.com/buildConfiguration/BackendBuild/139117?hideTestsFromDependencies=false&hideProblemsFromDependencies=false&expandBuildDeploymentsSection=false&pluginCoverage=true&expandBuildChangesSection=true  ";
        const expected = "https://serg-v.teamcity.com/buildConfiguration/BackendBuild/139117?hideTestsFromDependencies=false&hideProblemsFromDependencies=false&expandBuildDeploymentsSection=false&pluginCoverage=true&expandBuildChangesSection=true";
        expect(extractUrlFromString(input)).toEqual(expected);
    });

    it('should return null if no URL is found', () => {
        const input = "No URL in this string";
        expect(extractUrlFromString(input)).toBeNull();
    });
});
