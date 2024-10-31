import '@logseq/libs'
import {BlockEntity} from "@logseq/libs/dist/LSPlugin";

function main() {
    // @ts-ignore
    logseq.Editor.registerSlashCommand("teamcity", async () => {
        await logseq.UI.showMsg("Extract also!")
        const currentBlock = await logseq.Editor.getCurrentBlock()
        await updateTeamcityBlock(currentBlock);
    });

    logseq.App.onMacroRendererSlotted(({slot, payload}) => {
        console.log('macro renderer slotted', payload)
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
        if (status === 'IN_PROGRESS') {
            handleProgress(payload.uuid);
        }
    });
}

async function updateTeamcityBlock(currentBlock: BlockEntity) {
    let url = extractUrlFromString(currentBlock.content.trim())!;
    let build = parseBuildFromUrl(url);

    let status = await getBuild(build.id)
        .then((build) => getBuildStatus(build));

    await logseq.Editor.updateBlock(
        currentBlock.uuid,
        `[${build.name} #${build.id}](${url}) {{renderer :teamcity, ${status}}}`
    )
    return status
}

const inProgressHandlers = new Map<string, NodeJS.Timeout>();

function handleProgress(blockUuid: string) {
    if (inProgressHandlers.has(blockUuid)) return
    console.log('handleProgress', blockUuid);
    const timeout = setTimeout(async () => {
        const status = await logseq.Editor.getBlock(blockUuid).then(
            async (block) => {
                return await updateTeamcityBlock(block);
            }
        )
        inProgressHandlers.delete(blockUuid);
        if (status === 'IN_PROGRESS') {
            handleProgress(blockUuid);
        }
    }, 10000)

    inProgressHandlers.set(blockUuid, timeout);
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

    console.log('teamcityGet', path);

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
