import {fetchState, initialise, writeState} from "./git"
import {nextDraw} from "./draw"

type Config = {
    workingDir: string
    repoURL: string
    gitName: string
    refreshTimeMs: number,
}

type StartApp = () => void

export async function createApp(config: Config): Promise<StartApp> {
    // set up the repo and shared state
    await initialise(config)

    // return a command that can be used to start the app
    return () => {
        // start attempting to trigger draws every `refreshTimeMs`
        setInterval(() => attemptDraw(config), config.refreshTimeMs)
    }
}

async function attemptDraw(config: Config) {
    // this refresh isn't necessary once `push` is implemented
    const currentState = await fetchState(config)
    try {
        const nextState = await nextDraw(currentState)
        if (nextState === currentState) {
            console.log("No updates to process")
            return
        }
        await writeState(config, nextState)
        console.log("stored a draw successfully")
    } catch (err) {
        console.error("error attempting draw", err)
    }
}