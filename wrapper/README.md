# Kepler WebAssembly wrapper.

The Kepler typescript SDK depends on a WebAssembly backend written in Rust. This package exists to facilitate building a single Wasm dependency for multiple projects, by abstracting over the API of the Kepler SDK Wasm module.

If you are looking to use the Kepler SDK in your project, you probably want to use the package `kepler-sdk`, which comes pre-bundled with the Wasm dependency.
