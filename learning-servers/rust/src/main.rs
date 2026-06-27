use std::time::Duration;

use axum::http::{header, StatusCode};
use axum::response::IntoResponse;
use axum::{routing::get, Router};
use tokio::net::TcpListener;
use tokio::signal;
use tower_http::timeout::TimeoutLayer;
use tower_http::trace::TraceLayer;

// Baked into the binary at compile time; per-request work is assembling the PDF.
// 240x160 baseline JPEG, embedded via /DCTDecode.
static JPEG: &[u8] = include_bytes!("../../assets/sample.jpg");

async fn hello() -> &'static str {
    "Hello from Rust!\n"
}

fn build_pdf(text: &str) -> Vec<u8> {
    let content = format!(
        "BT\n/F1 24 Tf\n72 720 Td\n({text}) Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n"
    )
    .into_bytes();

    // Object 5 is the image (binary stream); object 6 is the content stream.
    let img_head = format!(
        "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB \
/BitsPerComponent 8 /Filter /DCTDecode /Length {} >>\nstream\n",
        JPEG.len()
    );
    let mut img = img_head.into_bytes();
    img.extend_from_slice(JPEG);
    img.extend_from_slice(b"\nendstream");

    let mut content_obj = format!("<< /Length {} >>\nstream\n", content.len()).into_bytes();
    content_obj.extend_from_slice(&content);
    content_obj.extend_from_slice(b"endstream");

    let objs: [Vec<u8>; 6] = [
        b"<< /Type /Catalog /Pages 2 0 R >>".to_vec(),
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>".to_vec(),
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>".to_vec(),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>".to_vec(),
        img,
        content_obj,
    ];

    let mut buf: Vec<u8> = Vec::with_capacity(JPEG.len() + 1024);
    buf.extend_from_slice(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n");
    let mut offsets = Vec::with_capacity(6);
    for (i, body) in objs.iter().enumerate() {
        offsets.push(buf.len());
        buf.extend_from_slice(format!("{} 0 obj\n", i + 1).as_bytes());
        buf.extend_from_slice(body);
        buf.extend_from_slice(b"\nendobj\n");
    }
    let xref_off = buf.len();
    buf.extend_from_slice(b"xref\n0 7\n0000000000 65535 f\r\n");
    for off in offsets {
        buf.extend_from_slice(format!("{off:010} 00000 n\r\n").as_bytes());
    }
    buf.extend_from_slice(
        format!("trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n{xref_off}\n%%EOF\n").as_bytes(),
    );
    buf
}

async fn pdf() -> impl IntoResponse {
    (
        [(header::CONTENT_TYPE, "application/pdf")],
        build_pdf("Hello from Rust! PDF benchmark."),
    )
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()),
        )
        .init();

    let app = Router::new()
        .route("/", get(hello))
        .route("/pdf", get(pdf))
        .layer(TraceLayer::new_for_http())
        // Slow handlers get a 408 instead of tying up a connection forever.
        .layer(TimeoutLayer::with_status_code(
            StatusCode::REQUEST_TIMEOUT,
            Duration::from_secs(15),
        ));

    let listener = TcpListener::bind("127.0.0.1:8080").await.unwrap();
    tracing::info!("listening on http://127.0.0.1:8080");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

// Resolves on Ctrl+C or SIGTERM so in-flight requests can finish before exit.
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
