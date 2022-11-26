fn main() {
    for n in 1..5 {
        if n % 2 == 0 {
            foo(n);
        }
        else {
            bar(n);
        }
    }
}

fn foo(n: i32) -> i32 {
    return n + 3;
}

fn bar(n: i32) -> i32 {
    return n + 1;
}

