use std::{env, process::Command};

use rustc_version::Channel;

const ALL_TARGETS: &[&str] = &[
    "thumbv6m-none-eabi",
    "thumbv7m-none-eabi",
    "aarch64-unknown-none",
];
const FMUL_TARGETS: &[&str] = &["thumbv6m-none-eabi", "thumbv7m-none-eabi"];

fn for_all_targets(mut f: impl FnMut(&str)) {
    for target in ALL_TARGETS {
        f(target)
    }
}

#[test]
fn cycle() {
    if channel_is_nightly() {
        // function calls on ARMv6-M use the stack
        let dot = call_stack("cycle", "thumbv7m-none-eabi");

        let mut found = false;
        for line in dot.lines() {
            if line.contains("label=\"_start\\n") {
                found = true;
                // worst-case stack usage must be exact
                assert!(line.contains("max = "));
            }
        }

        assert!(found);
    }
}

#[test]
fn fmul() {
    if channel_is_nightly() {
        for target in FMUL_TARGETS {
            let dot = call_stack("fmul", target);

            let mut entry_point = None;
            let mut fmul = None;

            for line in dot.lines() {
                if line.contains("label=\"_start\\n") {
                    entry_point = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                } else if line.contains("label=\"__aeabi_fmul\\n") {
                    fmul = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                }
            }

            let main = entry_point.unwrap();
            let fmul = fmul.unwrap();

            // there must be an edge between the entry point and `__aeabi_fmul`
            assert!(dot.contains(&format!("{} -> {}", main, fmul)));
        }
    }
}

#[test]
fn function_pointer() {
    if channel_is_nightly() {
        for_all_targets(|target| {
            let dot = call_stack("function-pointer", target);

            let mut foo = None;
            let mut bar = None;
            let mut fn_call = None;

            for line in dot.lines() {
                if line.contains("label=\"function_pointer::foo\\n") {
                    foo = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                } else if line.contains("label=\"function_pointer::bar\\n") {
                    bar = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                } else if line.contains("label=\"i1 ()*\\n") {
                    fn_call = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                }
            }

            let fn_call = fn_call.unwrap();
            let foo = foo.unwrap();
            let bar = bar.unwrap();

            // there must be an edge from the fictitious node to both `foo` and `bar`
            assert!(dot.contains(&format!("{} -> {}", fn_call, foo)));
            assert!(dot.contains(&format!("{} -> {}", fn_call, bar)));
        })
    }
}

#[test]
fn function_pointer_ptr() {
    if channel_is_nightly() {
        for_all_targets(|target| {
            let dot = call_stack("function-pointer-ptr", target);

            let mut foo = None;
            let mut bar = None;
            let mut fn_call = None;

            for line in dot.lines() {
                if line.contains("label=\"function_pointer_ptr::foo\\n") {
                    foo = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                } else if line.contains("label=\"function_pointer_ptr::bar\\n") {
                    bar = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                } else if line.contains("label=\"i1 (ptr)*\\n") {
                    fn_call = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                }
            }

            let fn_call = fn_call.unwrap();
            let foo = foo.unwrap();
            let bar = bar.unwrap();

            // there must be an edge from the fictitious node to both `foo` and `bar`
            assert!(dot.contains(&format!("{} -> {}", fn_call, foo)));
            assert!(dot.contains(&format!("{} -> {}", fn_call, bar)));
        })
    }
}

#[test]
fn dynamic_dispatch() {
    if channel_is_nightly() {
        for_all_targets(|target| {
            let dot = call_stack("dynamic-dispatch", target);

            let mut bar = None;
            let mut baz = None;
            let mut quux = None;
            let mut dyn_call = None;

            for line in dot.lines() {
                if line.contains("label=\"dynamic_dispatch::Foo::foo\\n") {
                    bar = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                } else if line
                    .contains("label=\"<dynamic_dispatch::Baz as dynamic_dispatch::Foo>::foo\\n")
                {
                    baz = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                } else if line.contains("label=\"dynamic_dispatch::Quux::foo\\n") {
                    quux = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                } else if line.contains("label=\"i1 (ptr)*\\n") {
                    dyn_call = Some(
                        line.split_whitespace()
                            .next()
                            .unwrap()
                            .parse::<u32>()
                            .unwrap(),
                    );
                }
            }

            let bar = bar.unwrap();
            let baz = baz.unwrap();
            let quux = quux.unwrap();
            let dyn_call = dyn_call.unwrap();

            // there must be an edge from the fictitious node to both `Bar` and `Baz`
            assert!(dot.contains(&format!("{} -> {}", dyn_call, bar)));
            assert!(dot.contains(&format!("{} -> {}", dyn_call, baz)));

            // but there must not be an edge from the fictitious node and `Quux`
            assert!(!dot.contains(&format!("{} -> {}", dyn_call, quux)));
        })
    }
}

#[test]
fn core_fmt() {
    if channel_is_nightly() {
        for_all_targets(|target| {
            let _should_not_error = call_stack("core-fmt", target);
        })
    }
}

#[test]
fn panic_fmt() {
    if channel_is_nightly() {
        for_all_targets(|target| {
            let _should_not_error = call_stack("panic-fmt", target);
        })
    }
}

#[test]
fn div64() {
    if channel_is_nightly() {
        for_all_targets(|target| {
            let _should_not_error = call_stack("div64", target);
        })
    }
}

#[test]
fn gh63() {
    if channel_is_nightly() {
        for_all_targets(|target| {
            let _should_not_error = call_stack("memcmp-ir-no-call", target);
        })
    }
}

#[test]
fn gh74() {
    if channel_is_nightly() {
        for_all_targets(|target| {
            let _should_not_error = call_stack("abs-i32", target);
        })
    }
}

fn channel_is_nightly() -> bool {
    rustc_version::version_meta().map(|m| m.channel).ok() == Some(Channel::Nightly)
}

fn call_stack(ex: &str, target: &str) -> String {
    let output = Command::new("cargo")
        .args(&["call-stack", "--example", ex, "--target", target])
        .current_dir(env::current_dir().unwrap().join("firmware"))
        .output()
        .unwrap();
    if !output.status.success() {
        panic!("{}", String::from_utf8(output.stderr).unwrap());
    }
    String::from_utf8(output.stdout).unwrap()
}
