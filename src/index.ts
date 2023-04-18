import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import {Change} from "firebase-functions"
import {DocumentSnapshot} from "firebase-functions/lib/v1/providers/firestore"
import {Repo} from "./repo"

export type Config = {
    workingDir: string
    stateRepo: string
    firebaseUrl: string
}

const config = {
    workingDir: "./state-repo",
    stateRepo: "https://github.com/CluEleSsUK/cool-test.git",
    firebaseUrl: "none"
}

admin.initializeApp()

export const createNewParticipant = functions.firestore.document("users/{userId}").onWrite(async (change: Change<DocumentSnapshot>, context: { params: { userId: string } }) => {
        const repo = await new Repo(config).create()
        const id = context.params.userId
        const longList = repo.longList()
        const participants = await longList.read()
        await longList.write([...participants, id], `added ${id} to long list`)
    }
)

// add to long list when added to firebase
// listen for new draws scheduled, and trigger the draw
// on draw, remove participants from long list, change status to 'ready to pay' or whatever