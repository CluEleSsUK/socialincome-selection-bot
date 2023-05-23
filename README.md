# Social Income Selection Bot

A github bot for doing and logging random selection from a pre-defined git repo

## Requirements
- node 19+
- npm 9+

## Running the application

### Git repo
First, you must set up a public git repository.
In it, 3 files must exist: `longlist.txt`, `upcoming-draws.txt` and `finished-draws.txt`

- longlist.txt

`longlist.txt` contains a list of all the things you want to choose from, separated by newlines.   
In the case of socialincome.org, this will be anonymised userIDs for each participant in the program

- upcoming-draws.txt

`upcoming-draws.txt` contains any draws you wish the bot to make.  
Each line constitutes a draw, and should be in the format `$millisecondsSince1970 $numberOfItemsFromLongListChosen`, e.g. the entry `1684849036926000 10` would choose 10 participants from the long list on the 23rd of May 2023 ~13:37UTC

- finished-draws.txt

`finished-draws.txt` will contain the output of any draws that have been completed by the bot.  
Once the bot completes a draw, it will remove the drawn entries from `longlist.txt`, remove the upcoming draw line from `upcoming-draws.txt`, and enter the results of the draw in `finished-draws.txt`. These results are of course repeatable by anybody running the code.

### Application

Install all the dependencies for the application by running `npm install`.
Update the configuration parameters in the [index file](./src/index.ts) (detailed instructions on configuration [below](#configuration))

Then run `npm start` to start the bot. It will automatically check out the repo and perform all syncing periodically.

### Configuration

The following configuration parameters are available for modification in the [index file](./src/index.ts):

- `workingDir`

This is the path that the bot will store the git repo that it operates on. Make sure the bot has write and read permissions to this location!

- `repoURL`

This is the remote github repository which the bot (and other operators) will be using for state management.

- `gitName`

This is name the bot will use as its author parameter for git commits

- `refreshTimeMs`

This is how often (in milliseconds) the bot will check the github repo for changes and potentially trigger any outstanding draws.


## TODO
- [ ] push support for the bot (rather than just storing things locally leading to merge conflicts)
- [ ] Firebase integration for storing new participants in the `longlist.txt`
- [ ] signed commits and PKI
- [ ] some fancier webhook magic to avoid polling