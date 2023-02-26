[TOC]

# How to use cargo-call-stack
Guide to getting cargo call stack to work
1. Does not work on Ubuntu 22.0X
2. Works on Ubuntu 20.04.05 LTS
3. Use other OSes at your own risk

## Install dependencies
run:
1. `cargo +stable install cargo-call-stack` 

## Configure unstable mode
run:
1. `export RUSTC_BOOTSTRAP=1`

## Find target 
run:
1. `rustup show`

copy the installed stable tool chain for rustc 1.65.0 (should be stable-x86_64-unknown-linux-gnu), we'll use this later when running the call-stack generator.

## Configure TOML
In the `.toml` file of your crate make sure the following is added:
```RUST
[profile.release]
lto = 'fat'
```

## Format code
In all your `.rs` files, make sure you add `#[inline(never)]` above functions you want to show up on the call graph.

### NOTE:
Functions that do nothing will be optimized away and will not show up on the call graph. See example `cargo-call-stack/examples/example` for details.

## Compile 
Build the crate you want to get a call stack for using `cargo build --target ` and then the tool chain you want .
Ex: `cargo build --target x86_64-unknown-linux-gnu`

## Run
Now run cargo-call-stack so that it targets the active toolchain and the associated binary: `cargo call-stack --bin example --target x86_64-unknown-linux-gnu > cg.dot`

### Getting an SVG
If you want to also get an svg out of the `dot` file then make sure you have graphviz installed (`sudo apt install graphviz`) then run `dot -Tsvg cg.dot > cg.svg`.

# Example 
In `./example` theres a sample rust project called `example.rs`.
