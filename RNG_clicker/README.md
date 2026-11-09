# Number Hunter — starter project

A small, vanilla-JavaScript starter for a manual, single-player number-rolling game.
It is designed to be hosted as a static website on GitHub Pages.

## What is included

- Manual rolls only. Nothing produces currency while the player is away.
- A local save using `localStorage`.
- A modular number-evaluation system, with one file per example rule.
- Example rules: even, odd, prime, palindrome, and perfect square.
- Example upgrades: Multi-roll and Number compression.
- A basic UI that displays EP, total rolls, the current range, recent results, and upgrades.
- A save version field so the save format can be migrated later.

The example EP values and upgrade prices are placeholders. They are intended to prove the structure, not to represent final game balance or RNGdle's scoring rules.

## Run it locally

Because this project uses JavaScript modules, serve the folder over a local web server rather than opening `index.html` directly with a `file://` URL.

With Python installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

Alternatively, use the VS Code Live Server extension.

## Publish on GitHub Pages

1. Create a GitHub repository for the game.
2. Put the contents of this folder in the repository root. `index.html` must be at the root.
3. Push the files to the `main` branch.
4. In the repository, open **Settings → Pages**.
5. Under the build and deployment options, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
6. Open the Pages URL GitHub gives you.

The paths in `index.html` are relative (`./styles.css` and `./src/main.js`), so they work on a GitHub Pages project site hosted under a repository path.

## Project structure

```text
number-game-starter/
├── index.html
├── styles.css
├── README.md
└── src/
    ├── config.js
    ├── main.js
    ├── state/
    │   └── gameState.js
    ├── storage/
    │   └── saveManager.js
    ├── ui/
    │   └── render.js
    └── game/
        ├── roll.js
        ├── evaluation/
        │   ├── evaluateNumber.js
        │   └── rules/
        │       ├── index.js
        │       ├── even.js
        │       ├── odd.js
        │       ├── prime.js
        │       ├── palindrome.js
        │       └── perfectSquare.js
        └── upgrades/
            ├── definitions.js
            └── upgradeManager.js
```

## Adding another evaluation rule

1. Create a new file in `src/game/evaluation/rules/`, for example `luckyNumber.js`.
2. Export a function that accepts a number.
3. Return `null` when the rule does not match.
4. When it matches, return an object containing `id`, `name`, `ep`, and `explanation`.
5. Import the function and add it to the `RULES` array in `src/game/evaluation/rules/index.js`.

Example rule:

```javascript
export function luckyNumberRule(number) {
    if (number !== 7) return null;

    return {
        id: "lucky-seven",
        name: "Lucky seven",
        ep: 10,
        explanation: "The number is 7."
    };
}
```

Every rule is checked independently. A number can match several rules and earn the sum of their EP values.

## Important design notes

- The starting roll range is inclusive: **0 through 1,000,000**. That means there are 1,000,001 possible results.
- The target is exactly `1`. A roll of `0` is possible but is not a win.
- The range-reduction upgrade has a 40-level cap and a hard lower bound of `2`, so it cannot make victory automatic. The player must still roll a `1` themselves.
- Multi-roll stops the current batch immediately if a `1` appears.
- `Math.random()` is not used. `roll.js` uses the browser's Web Crypto API with rejection sampling to avoid modulo bias.
- Local saves belong to the browser and website origin on that device. They do not follow a player to another browser or computer automatically.
- Local saves can be edited or deleted by players. This is fine for a single-player game, but it is not suitable as trusted proof for leaderboards or competitive rankings.

## Where to expand next

- Add your actual mathematical and cultural scoring rules under `rules/`.
- Decide whether each property can stack with others and define the EP values.
- Add a save export/import feature so players can back up progress.
- Add proper save migrations when the save structure changes.
- Add tests for rules and probability calculations.
- Add number reveal animations and a victory screen after the core rules are settled.
