# Kepler Typescript SDK

This module provides a convenient Typescript interface for accessing orbits in [Kepler](https://github.com/spruceid/kepler). 

## Quickstart
See the example dapp in `./example`.

## Installation

`kepler-sdk` is available via NPM:

``` sh
npm install kepler-sdk
```

and Yarn:

``` sh
yarn add kepler-sdk
```

The following webpack configuration is required:

```js
module.exports = {
    experiments: {
        asyncWebAssembly: true,
    },
}
```

## Concepts

### Hosts and Orbits

[Kepler](https://github.com/spruceid/kepler) is an application which provides user-controlled private, federated IPFS networks, called Orbits. For practical purposes, an Orbit can be thought of as analogous to an AWS S3 Bucket. A Host is a node in the federated IPFS network of an Orbit, designated by the controlling user(s) in the configuration options of the Orbit (called an Orbit Manifest).

### Authorization and Delegation

To enforce the sole controllership of the user (or users), all requests to modify the content of an Orbit must be authenticated and correctly authorized. As such they must be signed by either a controlling user, or a delegate which correctly authorized by a controlling user.

## Usage

The top-level `Kepler` class provides an API for connecting to a Kepler node and accessing an orbit belonging to an ethereum account.


``` typescript
import { Kepler } from 'kepler-sdk';
import { providers } from "ethers";

const metamaskSigner = new providers.Web3Provider(window.ethereum).getSigner();
const kepler = new Kepler(metamaskSigner);
```

### OrbitConnection Interface

The `OrbitConnection` class provides a simple CRUD interface for Blob storage, for a storage bucket
belonging to the connected ethereum account. It can be created from the `Kepler` object.

``` typescript
const orbitConnection: OrbitConnection | undefined = await kepler.orbit();
```

Once created, an `OrbitConnection` instance can upload objects to the Orbit:

``` typescript
const { ok, statusText } = await orbitConnection.put('my-content', new Blob( ... ));

if (!ok) {
    console.log("request failed: ", statusText)
}
```

Download objects from the Orbit:

``` typescript
const { data, ok } = await orbitConnection.get('my-content');

if (ok) {
    // use the data
}
```

Return just the metadata of an object:

``` typescript
const { headers, ok } = await orbitConnection.head('my-content');

if (ok) {
    headers.get('content-type');
}
```

List objects in the Orbit by prefix (returns an array of `string`s):

``` typescript
const { data, ok } = await orbitConnection.list('prefix');

if (ok) {
    for (key in data) {
        console.log(key)
    }
}
```

Delete objects from the Orbit:

``` typescript
const { ok } = await orbitConnection.delete('my-content');

if (ok) {
    // object has been deleted
}
```
Responses to the methods on `OrbitConnection` are a restricted version of the
[WHATWG-compliant Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response):

```typescript
const response: { 
    data?: any,
    ok: boolean,
    status: number,
    statusText: string,
    headers: Headers
} = await orbitConnection.get('my-content');
```

One major difference to the above-linked `Response` type is the `data` property. This property is only inhabited
when calling `get` or `list`. If the request parameter `{ streamBody: true }` is provided, then `data` will be a
`ReadableStream`:

```typescript
await orbit.list('prefix', { streamBody: true })
    .then(({ data }: { data?: ReadableStream }) => {
        // consume the stream
    });

await orbitConnection.put('myGif', new Blob([gifData], {'image/gif'}));
await orbitConnection.get('myGif', { streamBody: true })
    .then(({ data }: { data?: ReadableStream }) => {
        // consume the stream
    });
```

Otherwise, for the `list` function `data` will always be of type `string[]`, i.e. an array of keys.
For the `get` function the type of `data` depends on the value that is being retrieved:

```typescript
await orbitConnection.put('myPlainText', 'a string');
await orbitConnection.get('myPlainText')
    .then(({ data }: { data?: string }) => console.log(data));
// should log: 'a string'

await orbitConnection.put('myJson', { x: 1, y: true });
await orbitConnection.get('myJson')
    .then(({ data }: { data?: { x: number, y: boolean } }) => console.log(data));
// should log: '{x: 1, y: true}'

await orbitConnection.put('myBlob', new Blob([{ x: 1, y: true }], {'application/json'}));
await orbitConnection.get('myBlob')
    .then(({ data }: { data?: { x: number, y: boolean } }) => console.log(data));
// should log: '{x: 1, y: true}'

await orbitConnection.put('myGif', new Blob([gifData], {'image/gif'}));
await orbitConnection.get('myGif', { streamBody: true })
    .then(({ data }: { data?: Blob }) => {
        // use the Blob
    });

await orbit.list('prefix')
    .then(({ data }: { data?: string[] }) => {
        // use the list of keys
    });
```
