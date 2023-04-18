import * as path from "path"
// we have to use the sync version of "fs", as `isomorphic-git` doesn't seem to work with the async fs
// see: https://github.com/isomorphic-git/isomorphic-git/issues/1751
import * as fs from "fs"
import * as http from "isomorphic-git/http/node"
import * as git from "isomorphic-git"
import {Config} from "./index"

export class Repo {
    workingDir: string
    remote: string

    constructor(config: Config) {
        this.workingDir = config.workingDir
        this.remote = config.stateRepo
    }

    async create(): Promise<InitialisedRepo> {
        const dir = path.join(process.cwd(), this.workingDir)
        try {
            fs.mkdirSync(dir)

            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (err.code !== "EEXIST") {
                throw err
            }
        }

        await git.clone({fs, http, dir, url: this.remote, singleBranch: true, depth: 1})

        return new InitialisedRepo(this.workingDir)
    }
}

export class InitialisedRepo {
    constructor(private workingDir: string) {
    }

    longList(): RepoFile {
        return new RepoFile(this.workingDir, "longlist.txt")
    }

    upcomingDraws(): RepoFile {
        return new RepoFile(this.workingDir, "upcoming-draws.txt")
    }

    finishedDraws(): RepoFile {
        return new RepoFile(this.workingDir, "finished-draws.txt")
    }

}

export class RepoFile {
    private readonly workingDir: string
    private readonly filepath: string
    private readonly filename: string

    constructor(workingDir: string, filename: string) {
        this.workingDir = workingDir
        this.filename = filename
        this.filepath = path.join(workingDir, filename)
    }

    async read(): Promise<Array<string>> {
        const lines = fs.readFileSync(this.filepath, {encoding: "utf-8"})
        return lines.split("\n")
    }

    async write(participants: Array<string>, message = `updated ${this.filepath}`): Promise<void> {
        fs.writeFileSync(this.filepath, participants.join("\n"))
        const config = {
            fs,
            dir: this.workingDir,
            http,
            author: {name: "draw-bot"},
        }
        await git.pull(config)
        await git.add({...config, filepath: [this.filename]})
        await git.commit({...config, message})
        // should really push this too
    }

    async* listenChanges(frequencySeconds: number, abortController: AbortController): AsyncGenerator<string> {
        let last = ""
        while (!abortController.signal.aborted) {
            const file = await this.read()
            for (let i = 0; i < file.length; i++) {
                const line = file[i]
                if (line !== last) {
                    continue
                }
                if (i === file.length - 1) {
                    last = line
                }
                yield line
            }
            await sleep(frequencySeconds)
        }
    }
}

function sleep(second: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => resolve(), second * 1000)
    })
}
