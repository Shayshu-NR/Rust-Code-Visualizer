# Steps for rebuilding Cargo-callgraph

This directory contains the source files for Rust Stable version 1.65

In the parent directory are two more directories: baseline-rust, cargo-callgraph

### baseline-rust
This directory holds the version of rust that is the closest I could identify to the latest version of cargo-callgraph.
The commit ID on the Rust Github repo is f1c47c79fe8438ed241630f885797eebef3a6cab

### cargo-callgraph
This directory holds a copy of the most recent version of cargo-callgraph (From Feb. 11th, 2021).

## HOW TO REBUILD CARGO-CALLGRAPH
Use a file-differ tool to see the difference between directories baseline-rust and cargo-callgraph.
I recomment using BeyondCompare: https://www.scootersoftware.com/download.php

Log the differences between the two directories and apply the differences manually to the cargo-callgraph-rebuild directory.

