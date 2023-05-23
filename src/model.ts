export type RepoState = {
    upcomingDraws: Array<UpcomingDraw>
    finishedDraws: Array<CompletedDraw>
    participants: Array<Participant>
}

export type UpcomingDraw = {
    time: number
    countOfWinners: number
}

export type CompletedDraw = {
    time: number
    listHash: string
    winners: Array<Participant>
    randomness: string
}

export type Participant = string
