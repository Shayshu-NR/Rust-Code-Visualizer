fn main() {
    for n in 1..100 {
        foo(n);
    }
}

#[inline(never)]
fn foo(n: u16) {
    println!("{} loops remain", n);
}