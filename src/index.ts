import {createApp} from "./app"

const config = {
    workingDir: "./state-repo",
    repoURL: "https://github.com/CluEleSsUK/cool-test.git",
    gitName: "social-income-bot",
    refreshTimeMs: 1000,
}
createApp(config)
    .then(start => start())
