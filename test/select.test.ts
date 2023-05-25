import {describe, it} from "@jest/globals"
import {expect} from "chai"
import {HttpCachingChain, HttpChainClient} from "drand-client"

import {select} from "../src/select"

describe("select", () => {
    const drandClient = new HttpChainClient(new HttpCachingChain("https://pl-eu.testnet.drand.sh"))
    it("returns the whole list if it's less than count, without randomness", async () => {
        const options = {
            round: 1,
            count: 20,
            values: ["a", "b", "c", "d"],
            drandClient,
        }

        const result = await select(options)

        expect(result.winners).equals(options.values)
        expect(result.randomness).equals("")
    })

    it("returns nothing if count is 0, without randomness", async () => {
        const options = {
            round: 1,
            count: 0,
            values: ["a", "b", "c", "d"],
            drandClient,
        }

        const result = await select(options)

        expect(result.winners).deep.equals([])
        expect(result.randomness).equals("")
    })

    it("returns selected values from the list", async () => {
        const options = {
            round: 1,
            count: 2,
            values: ["a", "b", "c", "d"],
            drandClient,
        }

        const result = await select(options)

        expect(result.winners.length).equals(options.count)

        // they should have existed in the first place
        result.winners.forEach(w => options.values.includes(w))

        // winners should be unique!
        expect(new Set(result.winners).size == result.winners.length)
    })
})
