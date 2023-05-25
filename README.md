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
Each line constitutes a draw, and should be in the following format:  
`$millisecondsSince1970 $numberOfItemsFromLongListChosen`, 
e.g. the entry `1684849036926000 10` would choose 10 participants from the long list on the 23rd of May 2023 ~13:37UTC

- finished-draws.txt

`finished-draws.txt` will contain the output of any draws that have been completed by the bot.  
Once the bot completes a draw, it will remove the drawn entries from `longlist.txt`, remove the upcoming draw line from `upcoming-draws.txt`, and enter the results of the draw in `finished-draws.txt`. These results are of course repeatable by anybody running the code.  
The output will be in the following format:  
`$timeOfDraw $hashOfLongList $drawn,entries,separated,by,commas $randomnessUsed`,  
e.g. `1684850153837 5582919974b9af78ef505a87a7d9915e1e013826a41ea7dbdd572f46b977979f abc123 e8fee7dac6eb2b89df97d631cfccedbada7d5d05495bb546eef462e4145fdf8f` means that:
- at `1684850153837`ms from 1970 (ie. 23rd of May 2023 ~13:56UTC)
- from a list with the SHA256 hash `5582919974b9af78ef505a87a7d9915e1e013826a41ea7dbdd572f46b977979f` 
- the entry `abc123` was drawn from the long list 
- using the drand randomness value `e8fee7dac6eb2b89df97d631cfccedbada7d5d05495bb546eef462e4145fdf8f`  

Note: the SHA256 digest and random value (also a SHA256 digest) are both encoded in hexadecimal.

Next, you must create a [github fine-grained access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-fine-grained-personal-access-token) for the state repository.  
You should give it 'read and write permissions' under the 'Contents' section.
Once created, store it somewhere safe for use in the application.

### Application

Install all the dependencies for the application by running `npm install`.
Update the configuration parameters in the [index file](./src/index.ts) (detailed instructions on configuration [below](#configuration)).
Next, you must export the variable `AUTH_TOKEN` with the value of the fine-grained access token created above. This is required for the bot to have push access.

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

- `authToken`

This should be set to the value of the github personal access token that was set in the steps above. By exporting it as the environment variable `AUTH_TOKEN`, this will happen automatically.


## Miscellaneous
You can run the tests with `npm test`.
You can run the linter with `npm run lint`.
You can generate pure javascript by running `npm run build`.
If you get some issues such as `ReferenceError: fetch is not defined`, you probably need to update your version of Node to 19.

## TODO
- [x] push support for the bot (rather than just storing things locally leading to merge conflicts)
- [ ] Firebase integration for storing new participants in the `longlist.txt`
- [ ] signed commits and PKI
- [ ] some fancier webhook magic to avoid polling
- [ ] automate management of merge conflicts if updates to the repo conflict