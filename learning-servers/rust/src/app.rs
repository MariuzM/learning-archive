use std::time::Duration;

use axum::handler::Handler;
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::Router;
use tokio::net::TcpListener;
use tokio::signal;
use tower_http::timeout::TimeoutLayer;
use tower_http::trace::TraceLayer;

pub const HOST: &str = "127.0.0.1";
pub const PORT: u16 = 8080;

pub struct App {
    router: Router,
}

impl App {
    pub fn new() -> Self {
        App { router: Router::new() }
    }

    pub fn get<H, T>(mut self, path: &str, handler: H) -> Self
    where
        H: Handler<T, ()>,
        T: 'static,
    {
        self.router = self.router.route(path, get(handler));
        self
    }

    pub fn post<H, T>(mut self, path: &str, handler: H) -> Self
    where
        H: Handler<T, ()>,
        T: 'static,
    {
        self.router = self.router.route(path, post(handler));
        self
    }

    pub async fn listen(self) {
        let router = self.router.layer(TraceLayer::new_for_http()).layer(
            TimeoutLayer::with_status_code(StatusCode::REQUEST_TIMEOUT, Duration::from_secs(15)),
        );

        let listener = TcpListener::bind((HOST, PORT)).await.unwrap();
        tracing::info!("listening on http://{HOST}:{PORT}");

        axum::serve(listener, router)
            .with_graceful_shutdown(shutdown_signal())
            .await
            .unwrap();
    }
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("shutting down");
}
