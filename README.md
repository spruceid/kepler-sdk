# Kepler Typescript SDK

This module provides a convenient Typescript interface for accessing orbits in [Kepler](https://github.com/spruceid/kepler). 

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
const webpack = require('webpack');

module.exports = {
    plugins: [ 
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ],
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util/"),
            fs: false,
            path: false,
        }
    },
    experiments: {
        asyncWebAssembly: true,
    },
    ...
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
const orbitConnection = await kepler.orbit();
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
    // const content = data.text();
}
```

Return just the metadata of an object (a HEAD request):

``` typescript
const { headers, ok } = await orbitConnection.head('my-content');

if (ok) {
    // headers.get('content-type');
}
```

List all objects in the Orbit (returns an array of `string`s):

``` typescript
const { data, ok } = await orbitConnection.list();

if (ok) {
    //for (key in data) {
    //    console.log(key)
    //}
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

Additionally the response has a data property which can be converted based on request parameters
and the MIME type of the object:

```typescript
orbitConnection.put('myPlainText', 'a string', { type: 'text/plain' })
    .then(() => orbitConnection.get('myPlainText'))
    .then(({ data }: { data?: string }) => console.log(data));

orbitConnection.put('myJson', { x: 1, y: true }, { type: 'application/json' })
    .then(() => orbitConnection.get('myJson'))
    .then(({ data }: { data?: { x: number, y: boolean } }) => console.log(data));

orbitConnection.put('myBlob', new Blob(...))
    .then(() => orbitConnection.get('myBlob', { streamBody: true }))
    .then(({ data }: { data?: ReadableStream }) => {
        // consume the stream
    });
```