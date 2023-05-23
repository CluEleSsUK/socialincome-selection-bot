import * as path from "path"
import * as gitfs from "fs"
import * as fs from "fs/promises"
import * as git from "isomorphic-git"
import * as http from "isomorphic-git/http/node"
import {CompletedDraw, RepoState, UpcomingDraw} from "./model"

export type GitConfig = {
    workingDir: string
    repoURL: string
    gitName: string
}

export async function initialise(config: GitConfig): Promise<void> {
    const dir = path.join(process.cwd(), config.workingDir)
    try {
        await fs.mkdir(dir)

        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err.code !== "EEXIST") {
            throw err
        }
    }

    await git.clone({
        fs: gitfs,
        http,
        dir: config.workingDir,
        url: config.repoURL,
        singleBranch: true,
        depth: 1
    })
}

const upcomingDrawFile = "upcoming-draws.txt"
const finishedDrawFile = "finished-draws.txt"
const participantsFile = "longlist.txt"

export async function fetchState(config: GitConfig): Promise<RepoState> {
    const gitConf = asGitConfig(config)
    await git.pull(gitConf)

    const upcomingDraws = await readLines(config.workingDir, upcomingDrawFile)
        .then(draws => draws
            .filter(it => it !== "")
            .map(it => parseUpcomingDraw(it))
        )

    const finishedDraws = await readLines(config.workingDir, finishedDrawFile)
        .then(draws => draws
            .filter(it => it !== "")
            .map(it => parseFinishedDraw(it))
        )

    const participants = await readLines(config.workingDir, participantsFile)

    return {
        upcomingDraws,
        finishedDraws,
        participants
    }
}

export async function writeState(config: GitConfig, state: RepoState): Promise<void> {
    const gitConf = asGitConfig(config)
    const upcoming = state.upcomingDraws
        .map(it => `${it.time} ${it.countOfWinners}`)
        .join("\n")

    const finished = state.finishedDraws
        .map(it => `${it.time} ${it.listHash} ${it.winners.join(",")} ${it.randomness}`)
        .join("\n")

    const participants = state.participants.join("\n")

    await fs.writeFile(path.join(config.workingDir, upcomingDrawFile), upcoming)
    await fs.writeFile(path.join(config.workingDir, finishedDrawFile), finished)
    await fs.writeFile(path.join(config.workingDir, participantsFile), participants)

    await git.pull(gitConf)
    await git.add({
            ...gitConf,
            filepath: [upcomingDrawFile, finishedDrawFile, participantsFile]
        }
    )
    await git.commit({
        ...gitConf,
        message: "storing finished draw"
    })

    // this requires a little work as it needs some auth magic
    // await git.push(gitConf)
}

async function readLines(workingDir: string, filepath: string): Promise<Array<string>> {
    const contents = await fs.readFile(path.join(workingDir, filepath), {encoding: "utf-8"})
    // in case there are trailing newlines, we chop off any `""` values
    return contents.split("\n").filter(it => it !== "")
}

export function parseUpcomingDraw(input: string): UpcomingDraw {
    const matches = /^(\d+) (\d+)$/.exec(input)
    // 0 + 1 for each group
    if (!matches || matches.length !== 3) {
        throw Error(`invalid upcoming draw: ${input}`)
    }

    return {
        time: Number.parseInt(matches[1]),
        countOfWinners: Number.parseInt(matches[2]),
    }
}

export function parseFinishedDraw(input: string): CompletedDraw {
    const matches = /^(\d+) ([A-Fa-f0-9]+) (.*) ([A-Fa-f0-9]+)/.exec(input)

    // 0 + 1 for each group
    if (!matches || matches.length !== 5) {
        throw Error(`invalid finished draw: ${input}`)
    }

    const time = Number.parseInt(matches[1])
    const listHash = matches[2]
    const winners = matches[3].split(",")
    const randomness = matches[4]

    return {time, listHash, winners, randomness}
}

function asGitConfig(config: GitConfig) {
    return {
        fs: gitfs,
        http,
        dir: config.workingDir,
        author: {name: config.gitName},
    }
}