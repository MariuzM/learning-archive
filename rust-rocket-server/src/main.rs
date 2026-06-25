#[macro_use]
extern crate rocket;

use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};

use rocket::State;

#[get("/")]
fn hello() -> &'static str {
    "Hello, world!"
}

#[get("/greet/<name>")]
fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

#[get("/add/<a>/<b>")]
fn add(a: i64, b: i64) -> String {
    format!("{}", a + b)
}

#[get("/files/<path..>")]
fn files(path: PathBuf) -> String {
    format!("you asked for {}", path.display())
}

#[get("/search?<q>&<page>")]
fn search(q: &str, page: Option<usize>) -> String {
    format!("searching '{q}' (page {})", page.unwrap_or(1))
}

struct Hits(AtomicUsize);

#[get("/count")]
fn count(hits: &State<Hits>) -> String {
    let n = hits.0.fetch_add(1, Ordering::Relaxed) + 1;
    format!("visits: {n}")
}

#[catch(404)]
fn not_found() -> &'static str {
    "nothing here"
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .manage(Hits(AtomicUsize::new(0)))
        .mount("/", routes![hello, greet, add, files, search, count])
        .register("/", catchers![not_found])
}
