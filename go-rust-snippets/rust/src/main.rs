#![allow(dead_code)]
#![allow(unused_variables)]

use std::io;

mod cat;

#[path = "./modules/strings.rs"]
mod strings;
use strings::string_example;

#[path = "./utils/util.rs"]
mod util;

fn main() {
    cat::cat::meow();
    string_example();
    util::load();

    // array_example(); // Example 1: Working with arrays and user input

    // parsing_example(); // Example 2: Parsing strings to numbers

    // struct_example(); // Example 3: Working with structs and functions

    // scope_example(); // Example 4: Understanding scope and blocks

    // ownership_example(); // Example: Ownership and borrowing

    // mutable_borrowing_example(); // Example: Mutable borrowing
    //                              // match_example(); // Example: Enums and pattern matching
    // loop_example(); // New Example: Loops and control flow

    // option_example(); // New Example: Handling Options and error checking
}

// ------------------------------------------------------------------

fn array_example() {
    let a = [1, 2, 3, 4, 5];

    println!("Please enter an array index.");

    let mut index = String::new();
    io::stdin()
        .read_line(&mut index)
        .expect("Failed to read line");

    let index: usize = index
        .trim()
        .parse()
        .expect("Index entered was not a number");

    let element = a[index];
    println!("The value of the element at index {index} is: {element}");
    println!("-- End of Example: Working with arrays and user input --\n");
}

// ------------------------------------------------------------------

fn parsing_example() {
    let four: u32 = "4".parse().unwrap();
    println!("four: {four}");

    let four = "4".parse::<u32>().unwrap();
    println!("four: {four}");

    let four = "4".parse::<u32>().expect("I need a number");
    println!("four (with custom error message): {four}");
    println!("-- End of Example: Parsing strings to numbers --\n");
}

// ------------------------------------------------------------------

fn struct_example() {
    let user = create_user();
    println!("User email: {}", user.email);
    println!("-- End of Example: Working with structs and functions --\n");
}

struct User {
    email: String,
}

fn create_user() -> User {
    User {
        email: String::from("example@example.com"),
    }
}

// ------------------------------------------------------------------

fn scope_example() {
    let x = {
        let inner_value = 5;
        inner_value
    };
    println!("Value from inner scope: {x}");
    println!("-- End of Example: Understanding scope and blocks --\n");
}

// ------------------------------------------------------------------

fn ownership_example() {
    let s1 = String::from("Hello, Rust!");
    let s2 = &s1;

    println!("s1: {}, s2: {}", s1, s2);
    println!("-- End of Example: Ownership and borrowing --\n");
}

// ------------------------------------------------------------------

fn mutable_borrowing_example() {
    let mut s = String::from("Hello");
    modify_string(&mut s);
    println!("Modified string: {s}");
    println!("-- End of Example: Mutable borrowing --\n");
}

fn modify_string(s: &mut String) {
    s.push_str(", Rust!");
}

// ------------------------------------------------------------------

// fn match_example() {
//     let msg = Message::Move { x: 10, y: 20 };

//     match msg {
//         Message::Quit => println!("Quit variant"),
//         Message::Move { x, y } => println!("Move to coordinates: ({x}, {y})"),
//         Message::Write(text) => println!("Write message: {text}"),
//     }
//     println!("-- End of Example: Enums and pattern matching --\n");
// }

// ------------------------------------------------------------------

fn loop_example() {
    let mut count = 0;

    loop {
        count += 1;
        println!("Count: {count}");

        if count == 5 {
            break;
        }
    }
    println!("-- End of Example: Loops and control flow --\n");
}

// ------------------------------------------------------------------

fn option_example() {
    let some_number: Option<i32> = Some(10);
    let no_number: Option<i32> = None;

    match some_number {
        Some(n) => println!("We have a number: {n}"),
        None => println!("No number found"),
    }

    match no_number {
        Some(n) => println!("We have a number: {n}"),
        None => println!("No number found"),
    }
    println!("-- End of Example: Handling Options and error checking --\n");
}

// ------------------------------------------------------------------
