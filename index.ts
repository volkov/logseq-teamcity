import '@logseq/libs'

function main() {
    // @ts-ignore
    logseq.Editor.registerSlashCommand("teamcity", async () => {
        await logseq.UI.showMsg("Extract also!")
        const currentBlock = await logseq.Editor.getCurrentBlock()
        let build = parseBuildFromUrl(extractUrlFromString(currentBlock.content.trim())!);
        let status = await getBuild(build.id).then((build) => build.status);
        await logseq.Editor.updateBlock(
            currentBlock.uuid,
            `[${build.name} #${build.id}](${currentBlock.content.trim()}) - ${status}`
        )
    })
}

export function extractUrlFromString(input: string): string | null {
    const urlRegex = /(https?:\/\/[^\s)]+)/;
    const match = input.match(urlRegex);
    return match ? match[0] : null;
}

export function parseBuildFromUrl(url: string): { id: string, name: string } {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    return { id: parts[3], name: parts[2] };
}

export async function getBuild(id: string): Promise<any> {
    const response = await teamcityGet(`httpAuth/app/rest/builds/${id}`);
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    return await response.json();
}

async function teamcityGet(path: string) {
    let username = logseq.settings.username;
    let password = logseq.settings.password;
    let host = logseq.settings.host;

    return await fetch(`https://${host}/${path}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
            'Accept': 'application/json'
        }
    });
}

export async function getProjects(): Promise<any> {
    const response = await teamcityGet('httpAuth/app/rest/projects');
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    return await response.json();
}

logseq.ready(main).catch(console.error)
