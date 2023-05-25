import {createApp} from "./app"

const config = {
    workingDir: "./state-repo",
    repoURL: "https://github.com/CluEleSsUK/cool-test.git",
    gitName: "social-income-bot",
    refreshTimeMs: 3000,
    authToken: process.env["AUTH_TOKEN"] ?? ""
}
if (config.authToken === "") {
    console.error("you must provide an AUTH_TOKEN env var to interact with git")
    process.exit(1)
}
createApp(config)
    .then(start => start())
