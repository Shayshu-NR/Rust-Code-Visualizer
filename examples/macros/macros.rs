#[macro_export]
macro_rules! inline_function {() => {fn basic_fn() {println!("This boi basic");}};}

#[macro_export]
macro_rules! call_inline_function {
    () => {
        basic_fn();
    };
}

#[macro_export]
macro_rules! function_call {
    () => {
        fn not_that_basic_fn() {
            let x: i64 = 10;
            for i in 1..x+1 {
                println!("Not basic {}", i);
            }
        }
    };
}

#[macro_export]
macro_rules! call_function_call {
    () => {
        not_that_basic_fn();
    };
}

fn main() {
    call_inline_function!();
    call_function_call!();
}

inline_function!();

function_call!();