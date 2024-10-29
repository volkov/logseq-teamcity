import '@logseq/libs'

function main() {
    // @ts-ignore
    logseq.Editor.registerSlashCommand("teamcity", async () => {
        const currentBlock = await logseq.Editor.getCurrentBlock()
        await logseq.Editor.updateBlock(currentBlock.uuid, "Hi, I'm from TeamCity plugin!")
    })
}

logseq.ready(main).catch(console.error)
