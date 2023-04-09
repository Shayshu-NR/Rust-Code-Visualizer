
fn access_by_row(matrix: &Vec<Vec<u32>>, n: u32) {
    println!("Accessing by row");

    for i in 0..n {
        for j in 0..n {
            println!("Element: {}", matrix[i as usize][j as usize]);
        }
    }
}

fn access_by_col(matrix: &Vec<Vec<u32>>, n: u32) {
    println!("Accessing by coloumn");

    for j in 0..n {
        for i in 0..n {
            println!("Element: {}", matrix[i as usize][j as usize]);
        }
    }
}

fn gen_matrix(n: u32) -> Vec<Vec<u32>> {
    let mut v: Vec<Vec<u32>> = Vec::new();
    println!("Generating array");

    for _i in 0..n {
        let mut row: Vec<u32> = Vec::new();
        for _j in 0..n {
            row.push(0)
        }
        v.push(row);
    }

    return v;
}

fn main() {
    let matrix = gen_matrix(4000);
    access_by_col(&matrix, 4000);
    access_by_row(&matrix, 4000);
}