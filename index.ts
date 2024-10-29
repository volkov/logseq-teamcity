import '@logseq/libs'

function main() {
    // @ts-ignore
    logseq.Editor.registerSlashCommand("teamcity", async () => {
        const currentBlock = await logseq.Editor.getCurrentBlock()
        await logseq.Editor.updateBlock(currentBlock.uuid, "Hi, I'm from TeamCity plugin!")
    })
}

export async function getProjects() : Promise<any> {

    let username = 'username';
    let password = 'password';
    let host = 'somewhere.teamcity.com';

    const response = await fetch(`https://${host}/httpAuth/app/rest/projects`, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
            'Accept': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    return await response.json();
}

logseq.ready(main).catch(console.error)
