fn main() {
    let mut recursive_countdown: u16 = 100;

    foo(&mut recursive_countdown);
}

#[inline(never)]
fn foo(x: &mut u16) {
   if *x == 0 {
    return;
   }

   println!("{} iterations remain", x);

   *x -= 1;

}