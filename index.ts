import '@logseq/libs'

function main() {
    // @ts-ignore
    logseq.Editor.registerSlashCommand("teamcity", async () => {
        const currentBlock = await logseq.Editor.getCurrentBlock()
        await logseq.Editor.updateBlock(currentBlock.uuid, "Hi, I'm from TeamCity plugin! " + logseq.settings.test)
    })
}


//https://host/buildConfiguration/
// configname/139117?hideTestsFromDependencies=false&
// hideProblemsFromDependencies=false&expandBuildDeploymentsSection=false&pluginCoverage=true&expandBuildChangesSection=true



export async function getBuild(id) : Promise<any> {
    const response = await teamcityGet(`httpAuth/app/rest/builds/${id}`);
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    return await response.json();
}

async function teamcityGet(path) {
    let username = logseq.settings.username;
    let password = logseq.settings.password;
    let host = logseq.settings.host;

    const response = await fetch(`https://${host}/${path}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
            'Accept': 'application/json'
        }
    });
    return response;
}

export async function getProjects() : Promise<any> {
    const response = await teamcityGet('httpAuth/app/rest/projects');
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    return await response.json();
}

logseq.ready(main).catch(console.error)
