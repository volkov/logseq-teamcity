import '@logseq/libs'

function main() {
    // @ts-ignore
    logseq.Editor.registerSlashCommand("teamcity", async () => {
        await logseq.UI.showMsg("Extract also!")
        const currentBlock = await logseq.Editor.getCurrentBlock()
        let url = extractUrlFromString(currentBlock.content.trim())!;
        let build = parseBuildFromUrl(url);

        let status = await getBuild(build.id)
            .then((build) => getBuildStatus(build));

        await logseq.Editor.updateBlock(
            currentBlock.uuid,
            `[${build.name} #${build.id}](${url}) {{renderer :teamcity, ${status}}}`
        )
    });

    logseq.App.onMacroRendererSlotted(({slot, payload}) => {
        let [type, status] = payload.arguments
        if (type !== ':teamcity') return;

        const emoji = (() => {
            switch (status) {
                case 'SUCCESS':
                    return '✅';
                case 'FAILURE':
                    return '❌';
                case 'IN_PROGRESS':
                    return '⌛';
                default:
                    return '❓';
            }
        })();

        logseq.provideUI({
            key: 'teamcity-' + payload.uuid,
            slot,
            template: emoji,
        })
    });
}

export function extractUrlFromString(input: string): string | null {
    const urlRegex = /(https?:\/\/[^\s)]+)/;
    const match = input.match(urlRegex);
    return match ? match[0] : null;
}

export function parseBuildFromUrl(url: string): { id: string, name: string } {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    return {id: parts[3], name: parts[2]};
}

export function getBuildStatus(build: any): string {
    if (build.state === 'finished') {
        return build.status;
    }
    return 'IN_PROGRESS';
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
