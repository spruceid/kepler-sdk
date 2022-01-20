# Kepler Typescript SDK

This module provides a convenient Typescript interface for the [Kepler](https://github.com/spruceid/kepler) HTTP API, suitable for both NodeJS and browsers.

## Installation

`kepler-sdk` is available via NPM:

``` sh
npm install kepler-sdk
```

and Yarn:

``` sh
yarn add kepler-sdk
```

## Concepts

### Hosts and Orbits

[Kepler](https://github.com/spruceid/kepler) is an application which provides user-controlled private, federated IPFS networks, called Orbits. For practical purposes, an Orbit can be thought of as analogous to an AWS S3 Bucket. A Host is a node in the federated IPFS network of an Orbit, designated by the controlling user(s) in the configuration options of the Orbit (called an Orbit Manifest).

### Authorization and Delegation

To enforce the sole controllership of the user (or users), all requests to modify the content of an Orbit must be authenticated and correctly authorized. As such they must be signed by either a controlling user, or a delegate which correctly authorized by a controlling user.

## Usage

The top-level `Kepler` class provides an API for managing and interacting with a Kepler node. It requires a URL for the HTTP API of the node, as well as an `Authenticator`. A full example initialization using a [Sign In With Ethereum](https://github.com/spruceid/siwe) `Authenticator` follows:

``` typescript
import { Kepler, siweAuthenticator } from 'kepler-sdk';
import { providers } from "ethers";

const hostUrl = "http://localhost:8000";
const metamaskSigner = new providers.Web3Provider(window.ethereum).getSigner();
const siweAuth = await siweAuthenticator(metamaskSigner, "my.domain.com");

const kepler = new Kepler(hostUrl, siweAuth);
```

All HTTP request-based CRUD operations on the `S3` and `IPFS` classes return a [WHATWG-compliant Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response) for full inspectability.

### S3 Interface

The `S3` class provides a simple interface for Object storage which roughly matches AWS S3 in functionality. It can store Blobs of arbitrary size, with associated metadata inserted into the HTTP headers in the request. This class can be created from a `Kepler` instance using a given Orbit Identifier:

``` typescript
const orbitID = ""
const s3 = kepler.s3(orbitID);
```

Or independantly with the same parameters as the `Kepler` constructor with an Orbit Identifier:

``` typescript
import { S3 } from 'kepler-sdk';

const s3 = new S3(hostUrl, orbitID, siweAuth);
```

Once created, an `S3` instance can upload objects to the Orbit:

``` typescript
// metadata to be included in headers and associated with the 'my-content' key
const objectMetadata = {
    metadata: "some metadata",
    moreMetadata: "some more metadata"
}

const response = await s3.put('my-content', new Blob( ... ), objectMetadata);

if (response.status !== 200) {
    console.log("request failed: ", await response.text())
}
```

Download objects from the Orbit:

``` typescript
const response = await s3.get('my-content');

if (response.status === 200) {
    const blob = await response.blob();
    const headers = response.headers;
    // headers.metadata === "some metadata"
    // headers.moreMetadata === "some more metadata"
}
```

Return just the metadata of an object (a HEAD request):

``` typescript
const response = await s3.head('my-content');

if (response.status === 200) {
    // response.headers.metadata === "some metadata"
    // response.headers.moreMetadata === "some more metadata"
}
```

List all objects in the Orbit (returns a JSON array of `string`s):

``` typescript
const response = await s3.list();

if (response.status === 200) {
    const keys = await response.text().then(s => JSON.parse(s));
}
```

Delete objects from the Orbit:

``` typescript
const response = await s3.del('my-content');

if (response.status === 200) {
    // object has been deleted
}
```

### IPFS Interface

The `Ipfs` class provides a simplified IPFS interface to the lower-level block storage of an Orbit. Compared to the `S3` interface, it provides less features but a higher degree of control over how the contents of the Orbit are structured. Similarly to the `S3` class it can be instantiated from a `Kepler` instance:

``` typescript
const orbitID = ""
const ipfs = kepler.ipfs(orbitID);
```

Or independantly with the same parameters as the `Kepler` constructor with an Orbit Identifier:

``` typescript
import { Ipfs } from 'kepler-sdk';

const ipfs = new Ipfs(hostUrl, orbitID, siweAuth);
```

Content can also be uploaded via the `Ipfs` class, including multiple blobs at once. Each blob is converted into an IPFS Block and as such there is a 1 megabyte limit on blob size for this class. This returns a JSON list of CIDs corrosponding to the uploaded Blocks:

``` typescript
const response = await ipfs.put(new Blob( ... ), new Blob( ... ), ...);

if (response.status === 200) {
    const cids = await response.text().then(s => JSON.parse(s));
}
```

Reading a block returns the Block contents:

``` typescript
const response = await ipfs.get(cids[0]);

if (response.status === 200) {
    const block = await response.blob();
}
```

Deleting a block is also easy:

``` typescript
const response = await ipfs.del(cids[0]);

if (response.status === 200) {
    // block deleted
}
```

All pinned blocks in the Orbit can also be listed, however this will also include blocks pinned by the IPLD-DAG structure which backs the `S3` store:

``` typescript
const response = await ipfs.list();

if (response.status === 200) {
    const pinnedCids = await response.text().then(s => JSON.parse(s));
}
```

## Authenticators

The Kepler client requires a means to authenticate the authorization tokens it includes in requests. This is represented by the `Authenticator` interface. There are three existing implementations of `Authenticator`, tailored for different user experiances and using different standards.

Some `Authenticators` include a means for delegation, such that they can support authorization without being listed as a controlling user by including a proof of capability delegation issued to them by controlling user.

### [Sign In With Ethereum](https://github.com/spruceid/siwe)

Allows for user-friendly Web3 integration, including delegation. The SIWE authenticator is included in `kepler-sdk`:

``` typescript
import { Kepler, siweAuthenticator } from 'kepler-sdk';
import { providers } from "ethers";

const metamaskSigner = new providers.Web3Provider(window.ethereum).getSigner();
const siweAuth = await siweAuthenticator(metamaskSigner, "my.domain.com");
```

Delegation is implemented for this authenticator via the `startSIWESession` function, allowing a different public key to invoke the session capability and perform actions on Orbit resources:

``` typescript
import { startSIWESession } from 'kepler-sdk';
import { Wallet } from "ethers";

const sessionKey = Wallet.createRandom();
const sessionKeyId = `did:pkh:eip155:1:${await sessionKey.getAddress()}#blockchainAccountId`;

const sessionToken = await startSIWESession(
    orbitID,
    "my.domain.com",
    "1",    // Ethereum chain ID, "1" === main net (there is no on-chain interaction, only required by the SIWE spec),
    await metamaskSigner.getAddress(),
    sessionKeyId,
    ['put', 'del', 'get', 'list'],
    { exp: new Date( ... ), nbf: new Date( ... ) } // extra options
);

// sign the session token with the controller signer
sessionToken.signature = await metamaskSigner.signMessage(sessionToken.toMessage());

const sessionAuthenticator = await siweAuthenticator(sessionKey, "my.domain.com", sessionToken);
```

Delegation can be used to improve the user experience of using Kepler in Web3 DApps by removing the need for a the user to approve a Metamask signing request each time the SIWE authenticator is used. The user instead approves a single request which temporarily grants the given capabilities to the DApp-controlled `sessionKey`.

### [ZCAP-LD](https://www.npmjs.com/package/@spruceid/zcap-providers)

[Authorization Capabilities for Linked Data (ZCAP-LD)](https://w3c-ccg.github.io/zcap-ld/) is a format for expressing authorization capabilities specified by the W3C. It is supported by Kepler as an authorization token type in order to support the wider DID ecosystem. In practice, using it with Kepler is similar to SIWE: an authenticator is provided as part of `kepler-sdk`, with the full ZCAP implementation residing in the `@spruceid/zcap-providers` package. This allows for integration with any system supporting a DID method, notably `did:key` (providing support for JWK's) and `did:pkh` (providing support for all popular blockchain account systems). These implementations depend on the WASM port of [DIDKit](https://spruceid.dev/docs/didkit/): `@spruceid/didkit-wasm`. A full example follows:

``` typescript
import { zcapAuthenticator } from 'kepler-sdk';
import { Capabilities, didkey, genJWK } from '@spruceid/zcap-providers';
import * as didkit from '@spruceid/didkit-wasm';

const jwk = genJWK(didkit); // or from whereever the JWK is stored
const didKeyCapabilities = await didkey(jwk, didkit);
const didKeyAuth = await zcapAuthenticator(didKeyCapabilities)


const kepler = new Kepler(hostUrl, didKeyAuth);
```

ZCAP-LD also supports delegation, similarly to SIWE as above. The most common scenario for delegation is delegating capabilities from a Metamask wallet to a DApp-controlled JWK. The ZCAP-LD authenticator is best suited to this, as DApps can bring their own JWK or easily generate one randomly:

``` typescript
import { startSIWESession } from 'kepler-sdk';
import { Wallet } from "ethers";

const jwk = genJWK(didkit); // generate a random session key
const didKeyCapabilities = await didkey(jwk, didkit);
const didKeyAuth = await zcapAuthenticator(didKeyCapabilities)

// delegate to session key
const sessionToken = await startSIWESession(
    orbitID,
    "my.domain.com",
    "1",
    await metamaskSigner.getAddress(),
    didKeyCapabilities.id(),
    ['put', 'del', 'get', 'list'],
    { exp: new Date( ... ), nbf: new Date( ... ) } // extra options
);

// sign the session token with the controller signer
sessionToken.signature = await metamaskSigner.signMessage(sessionToken.toMessage());

// create Kepler instance with authenticator for this session
const sessionAuthenticator = await zcapAuthenticator(sessionKey, sessionToken);
const kepler = new Kepler(hostUrl, sessionAuthenticator);
```
