
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

#[inline(never)]
fn foo(n: i32) -> i32 {
    let x = n + 3;
    return x;
}

#[inline(never)]
fn bar(n: i32) -> i32 {
    println!("boogers2");
    return n + 1;
}

