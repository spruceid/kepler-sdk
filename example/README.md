# Example Dapp using Kepler SDK

An example dapp using a local instance of Kepler.

## Requirements:
- Latest [Rust](https://rustup.rs) version
- [node](https://nodejs.dev)
- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- [yarn](https://yarnpkg.com)
- a browser with the [metamask wallet extension](https://metamask.io), and a ethereum account connected to the wallet


## Usage

### Run Kepler locally


Clone the Kepler repo:
```bash
git clone git@github.com:spruceid/kepler
cd kepler
```

Run Kepler:
```bash
mkdir -p /tmp/kepler/indexes /tmp/kepler/blocks
cargo run
```

### Launch the Dapp

Bundle and run the Dapp:
```bash
nvm install
yarn serve
```

Browse to `http://localhost:8080/index.html`.
