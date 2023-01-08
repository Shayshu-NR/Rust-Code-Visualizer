#![no_main]


use core::ptr;

use cortex_m_rt::{entry, exception};

#[entry]
fn main() -> ! {
    foo();

    bar();

    loop {}
}

#[inline(never)]
fn foo() {
    // spill variables onto the stack
    unsafe { println!("boogers") }
}

//#[inline(never)]
fn bar() {
    unsafe { println!("boogers2") }
}

#[exception]
fn SysTick() {
    bar();
}

#[inline(never)]
fn baz() {
    let x = 0;
    unsafe {
        // force `x` to be on the stack
        ptr::read_volatile(&&x);
    }

}