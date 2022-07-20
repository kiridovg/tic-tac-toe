Tic-tac-toe
=================================

## Description
This contract implements a tic-tac-toe game backed by blockchain storage.
The contract in `contract/src/lib.rs` provides methods for getting the user's bid/removing the bid for one game and getting the values of the current bid.

## How To Run

```bash
git clone git@github.com:kiridovg/tic-tac-toe.git

cd tic-tac-toe

npm install

npm run serve
```

## Setup
If you don't have `Rust` installed, complete the following 3 steps:

1) Install Rustup by running:

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

([Taken from official installation guide](https://www.rust-lang.org/tools/install))

2) Configure your current shell by running:

```
source $HOME/.cargo/env
```

3) Add wasm target to your toolchain by running:

```
rustup target add wasm32-unknown-unknown
```

Next, make sure you have `near-cli` by running:

```
near --version
```

If you need to install `near-cli`:

```
npm install near-cli -g
```

## To Test

```
yarn test
```
