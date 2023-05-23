import {HttpCachingChain, HttpChainClient, roundAt} from "drand-client"
import {select} from "./select"
import {RepoState} from "./model"
import {Selection} from "./select"

export async function nextDraw(state: RepoState, selectionFn: Selection = select): Promise<RepoState> {
    if (state.upcomingDraws.length === 0) {
        return state
    }
    const drawsByTime = state.upcomingDraws.slice()
        .sort((a, b) => a.time - b.time)

    const nextDraw = drawsByTime[0]
    const now = Date.now()
    if (nextDraw.time > now) {
        return state
    }

    const chain = new HttpCachingChain("https://api.drand.sh")
    const drandClient = new HttpChainClient(chain)
    const selectionOptions = {
        round: roundAt(nextDraw.time, await chain.info()),
        count: nextDraw.countOfWinners,
        values: state.participants,
        drandClient,
    }

    const {winners, hashedInput, randomness} = await selectionFn(selectionOptions)
    const nextParticipants = state.participants.filter(it => !winners.includes(it))

    return {
        participants: nextParticipants,
        upcomingDraws: state.upcomingDraws.slice(1, state.upcomingDraws.length),
        finishedDraws: [...state.finishedDraws, {
            time: now,
            listHash: hashedInput,
            winners,
            randomness
        }]
    }
}