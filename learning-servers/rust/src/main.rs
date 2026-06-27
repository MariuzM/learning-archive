mod app;
mod pdf;
mod validate;

use app::App;

async fn hello() -> &'static str {
    "Hello from Rust!\n"
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()),
        )
        .init();

    App::new()
        .get("/", hello)
        .get("/pdf", pdf::pdf)
        .post("/validate", validate::validate)
        .listen()
        .await;
}
