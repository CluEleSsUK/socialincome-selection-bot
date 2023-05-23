import {describe, it} from "@jest/globals"
import {expect} from "chai"
import { randomUUID } from "crypto"
import {fetchState, GitConfig, initialise, parseFinishedDraw, parseUpcomingDraw, writeState} from "../src/git"

export const testConfig: GitConfig = {
    workingDir: "./state-repo",
    repoURL: "https://github.com/CluEleSsUK/cool-test.git",
    gitName: "social-income-bot"
}
describe("git", () => {

    describe("e2e", () => {
        it("can update and read files from git", async () => {
            const participantToAdd = randomUUID()

            await initialise(testConfig)
            const currentState = await fetchState(testConfig)
            currentState.participants = [...currentState.participants, participantToAdd]

            await writeState(testConfig, currentState)
            const newState = await fetchState(testConfig)

            expect(newState.participants).includes(participantToAdd)
        })
    })

    describe("parsing", () => {
        describe("upcoming draws", () => {
            it("should parse a valid upcoming draw", () => {
                const result = parseUpcomingDraw("0 5")

                expect(result.time).equals(0)
                expect(result.countOfWinners).equals(5)
            })
            it("should reject negative times", () => {
                expect(() => parseUpcomingDraw("-1 5")).throws()
            })
            it("should reject negative counts", () => {
                expect(() => parseUpcomingDraw("1 -5")).throws()
            })
            it("should reject non-numbers", () => {
                expect(() => parseUpcomingDraw("a 5")).throws()
            })
            it("should reject floating point numbers", () => {
                expect(() => parseUpcomingDraw("5 5.55")).throws()
            })
            it("should accept multi-digit numbers", () => {
                const result = parseUpcomingDraw("10 501")

                expect(result.time).equals(10)
                expect(result.countOfWinners).equals(501)
            })
        })

        describe("completed draws", () => {
            it("should parse a valid completed draw", () => {
                const result = parseFinishedDraw("1 deadbeef abc,def,ghi cafebabe")

                expect(result.time).equals(1)
                expect(result.listHash).equals("deadbeef")
                expect(result.winners).deep.equals(["abc", "def", "ghi"])
                expect(result.randomness).equals("cafebabe")
            })
            it("should parse a single chosen participant", () => {
                const result = parseFinishedDraw("2 deadbeef abc cafebabe")

                expect(result.time).equals(2)
                expect(result.listHash).equals("deadbeef")
                expect(result.winners).deep.equals(["abc"])
                expect(result.randomness).equals("cafebabe")
            })
            it("should reject draws with a negative time", () => {
                expect(() => parseFinishedDraw("-1 deadbeef abc,def,ghi cafebabe")).throws()
            })
            it("should reject non-hex list hash", () => {
                expect(() => parseFinishedDraw("-1 nothex abc,def,ghi cafebabe")).throws()
            })
            it("should reject non-hex randomness", () => {
                expect(() => parseFinishedDraw("-1 deadbeef abc,def,ghi nothex")).throws()
            })
            it("should reject non-comma-separated finished draws", () => {
                expect(() => parseFinishedDraw("-1 deadbeef abc def ghi nothex")).throws()
            })
            it("should reject excess input", () => {
                expect(() => parseFinishedDraw("-1 deadbeef abc def ghi cafebabe some-extra-stuff")).throws()
            })
        })
    })
})