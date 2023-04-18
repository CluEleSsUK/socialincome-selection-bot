# Social Income Functions

Some firebase functions demonstrating how the socialincome.org backend could interact with the [drandomiser](https://github.com/drand/drandomiser) tool for doing random selection of participants

## Requirements
- node 16+
- npm 9+
- Java 8+

## Running locally
- install all the dependencies with `npm install`
- install `firebase-tools` with `npm install -g firebase-tools`
- initialise the firebase emulator by running `firebase init emulators` and selecting mostly the defaults in the prompts. This will also download the emulators for your machine
- run the emulator locally and deploy the relevant cloud functions with `npm run serve`. It will output specific functions, but you will likely direct you to [http://127.0.0.1:4000/](http://127.0.0.1:4000/), the emulator UI where you can see things like function calls. Try creating a collection called `/users` and adding an ID below it!

## Deploying to a real firebase
... probably don't do this yet