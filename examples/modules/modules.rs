fn main() {
    let mut e: Example = Example { number: 0, num_accessed: 0 };
    e.see_my_number();
    Example::boo();
    e.answer();
    e.see_my_number();
    println!("{}", e.get_number());
    println!("{}", e.num_accessed);
}

struct Example {
    number: i32,
    num_accessed: i32,
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
    fn get_number(&mut self) -> i32 {
        self.num_accessed += 1;
        self.number
    }

#[inline(never)]
    fn see_my_number(&self) {
        println!("{}", self.number);
    }
}