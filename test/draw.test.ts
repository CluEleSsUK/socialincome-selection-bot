import {describe, it} from "@jest/globals"
import {expect} from "chai"
import {nextDraw} from "../src/draw"

describe("draw", () => {
    it("returns the same state if there are no upcoming draws", async () => {
        const input = {
            upcomingDraws: [],
            finishedDraws: [],
            participants: ["alice", "bob", "carol"]
        }
        const output = await nextDraw(input)
        expect(output).equals(input)
    })
    it("returns the same state if there are upcoming draws but they are in the future", async () => {
        const input = {
            upcomingDraws: [{
                time: Date.now() + 10000,
                countOfWinners: 10
            }],
            finishedDraws: [],
            participants: ["alice", "bob", "carol"]
        }
        const output = await nextDraw(input)
        expect(output).equals(input)
    })
    it("removes the upcoming draw from the upcoming draws once selection is completed", async () => {
        const input = {
            upcomingDraws: [{
                time: Date.now(),
                countOfWinners: 10
            }],
            finishedDraws: [],
            participants: ["alice", "bob", "carol"]
        }
        const output = await nextDraw(input)
        expect(output.upcomingDraws).deep.equals([])
    })
    it("removes participants from the list once they are selected", async () => {
        const input = {
            upcomingDraws: [{
                time: Date.now(),
                countOfWinners: 2
            }],
            finishedDraws: [],
            participants: ["alice", "bob", "carol"]
        }
        const mockSelectionFunction = () => {
            return Promise.resolve({
                hashedInput: "cafebabecafebabe",
                randomness: "deadbeefdeadbeefdeadbeef",
                winners: ["bob", "carol"]
            })
        }
        const output = await nextDraw(input, mockSelectionFunction)
        expect(output.participants).deep.equals(["alice"])
    })
    it("adds a new finished draw to completed draws once selection is completed", async () => {
        const input = {
            upcomingDraws: [{
                time: Date.now(),
                countOfWinners: 2
            }],
            finishedDraws: [],
            participants: ["alice", "bob", "carol"]
        }
        const mockSelectionFunction = () => {
            return Promise.resolve({
                hashedInput: "cafebabecafebabe",
                randomness: "deadbeefdeadbeefdeadbeef",
                winners: ["bob", "carol"]
            })
        }
        const output = await nextDraw(input, mockSelectionFunction)
        expect(output.finishedDraws).has.length(1)
        expect(output.finishedDraws[0].listHash).equals("cafebabecafebabe")
        expect(output.finishedDraws[0].randomness).equals("deadbeefdeadbeefdeadbeef")
        expect(output.finishedDraws[0].winners).deep.equals(["bob", "carol"])
    })
})