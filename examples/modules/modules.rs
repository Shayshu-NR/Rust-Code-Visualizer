fn main() {
    let mut e: Example = Example { number: 0 };
    e.see_my_number();
    Example::boo();
    e.answer();
    e.see_my_number();
    println!("{}", e.get_number())
}

struct Example {
    number: i32,
}

impl Example {
#[inline(never)]
    fn boo() {
        println!("boo! Example::boo() was called!");
    }

#[inline(never)]
    fn answer(&mut self) {
        self.number += 42;
    }

#[inline(never)]
    fn get_number(&self) -> i32 {
        self.number
    }

#[inline(never)]
    fn see_my_number(&self) {
        println!("{}", self.get_number());
    }
}