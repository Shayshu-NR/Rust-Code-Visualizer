//use std::env;

fn main() {
    //let args: Vec<String> = env::args().collect();
    //let mut begin_countdown: u16 = args[1].parse().unwrap();
    let mut begin_countdown: u16 = 100;

    while begin_countdown > 0 {
        foo(&mut begin_countdown);
    }
}

#[inline(never)]
fn foo(x: &mut u16) {
    println!("{} loops remain", x);
    *x -= 1;
}