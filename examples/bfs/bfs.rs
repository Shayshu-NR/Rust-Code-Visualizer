use std::collections::VecDeque;

#[inline(never)]
fn check_end_condition(node_value: u32, to: u32) -> bool {
    println!("Checking end condition");
    if node_value == to {
        return true;
    }
    else {
        return false;
    }
}

#[inline(never)]
fn generate_path(to: u32, from: u32, path: &mut Vec<u32>, visited: Vec<u32>) {
    println!("Genrating path");
    let mut p = to;

    path.push(p);

    while p != from {
        p = visited[p as usize];
        path.push(p);
    }

    path.reverse();

    return;
}

#[inline(never)]
fn set_visited_nodes(node_value: u32, v: &Vec<Vec<u32>>, visited: &mut Vec<u32>, frontier: &mut VecDeque<u32>) {
    println!("setting visited nodes");
    let nbrs = &v[node_value as usize];

    for n in nbrs {
        if visited[*n as usize] == 0xffff {
            visited[*n as usize] = node_value;
            frontier.push_back(*n);
        }
    }
}

#[inline(never)]
fn bfs_trace(from: u32, to: u32, v: &Vec<Vec<u32>>) -> Vec<u32> {
    println!("tracing path");
    let mut frontier:   VecDeque<u32>   = VecDeque::new();
    let mut path:       Vec<u32>        = Vec::new();
    let mut visited:    Vec<u32>        = Vec::new();

    visited.resize(v.len(), 0xffff);

    frontier.push_front(from);
    visited[from as usize] = from;

    while !frontier.is_empty() {
        let p = frontier.pop_front();

        if check_end_condition(p.unwrap(), to) {
            break;
        }

        set_visited_nodes(p.unwrap(), &v, &mut visited, &mut frontier);
    }

    generate_path(to, from, &mut path, visited);

    return path;
}

#[inline(never)]
fn gen_field_graph(n: u32) -> Vec<Vec<u32>> {
    let mut v: Vec<Vec<u32>> = Vec::new();
    println!("Generating graph");

    for y in 0..n {
        for x in 0..n {
            let mut row: Vec<u32> = Vec::new();
            let pos = x + y * n;

            if pos % n > 0 {
                row.push(pos - 1);  // west
            }

            if pos < n * (n - 1) {
                row.push(pos + n);  // south
            }

            if pos % n < (n - 1) {
                row.push(pos + 1);  // east
            }

            if pos >= n {
                row.push(pos - n);  // north
            }

            v.push(row);
        }
    }

    return v;
}

fn main() {

    let start_point = 10;
    let end_point   =  3;

    let g       = gen_field_graph(4);
    let path    = bfs_trace(start_point, end_point, &g);

    println!("{:?} ", path);
}