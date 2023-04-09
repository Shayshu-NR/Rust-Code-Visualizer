struct Val {
    val: f64,
}

struct GenVal<T> {
    gen_val: T,
}

// impl of Val
impl Val {
    #[inline(never)]
fn value(&self) -> &f64 {
        println!("Returning val");
        &self.val
    }
}

// impl of GenVal for a generic type `T`
impl<T> GenVal<T> {

    #[inline(never)]
fn value(&self) -> &T {
        println!("Returning gen val");
        &self.gen_val
    }
}

fn main() {
    for i in 1..1000{
        let x = Val { val: 3.0 };
        let y = GenVal { gen_val: i };
    
        println!("{}, {}", x.value(), y.value());
    }
}