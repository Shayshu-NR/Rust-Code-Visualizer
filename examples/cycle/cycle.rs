//use rand::Rng;

fn main() {
    foo(0);
    cycle_exit();
}

// these three functions form a cycle that breaks when `x` is `false`
#[inline(never)]
fn foo(y: u8) {
    println!("{}", y);
    
    //let mut rng = rand::thread_rng();

    //let x: u8 = rng.gen();
    let x: u8 = 1;
    
    if x != 0 {
        bar(x)
    }
}

#[inline(never)]
fn bar(x: u8) {
    baz(x)
}

#[inline(never)]
fn baz(x: u8) {
    foo(x)
}

#[inline(never)]
fn cycle_exit() {
    // spill variables onto the stack
    println!("done");
}
