pub fn string_example() {
    let s = String::from("Hello, Rust!");
    println!("Original string: {s}");

    let s2 = s.replace("Rust", "World");
    println!("Replaced string: {s2}");

    let s3 = s2.to_uppercase();
    println!("Uppercase string: {s3}");

    let s4 = s3.to_lowercase();
    println!("Lowercase string: {s4}");

    let s5 = s4.trim();
    println!("Trimmed string: {s5}");

    let s6 = s5.repeat(3);
    println!("Repeated string: {s6}");

    println!("-- End of Example: Working with strings --\n");
}
