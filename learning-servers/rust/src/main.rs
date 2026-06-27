use std::sync::LazyLock;
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

// The text to render, parsed once at startup. ~100 pages of lines.
static CONTENT_JSON: &str = include_str!("../../assets/content.json");
static LINES: LazyLock<Vec<String>> = LazyLock::new(|| {
    let v: serde_json::Value = serde_json::from_str(CONTENT_JSON).expect("parse content.json");
    v["lines"]
        .as_array()
        .expect("content.json: lines array")
        .iter()
        .map(|x| x.as_str().unwrap().to_string())
        .collect()
});

const LINES_PER_PAGE: usize = 45;
const FONT_SIZE: i32 = 11;
const LINE_STEP: i32 = 16;
const TOP_Y: i32 = 740;

async fn hello() -> &'static str {
    "Hello from Rust!\n"
}

// One cover page (heading + JPEG) then the JSON text paginated 45 lines/page.
fn build_pdf(heading: &str) -> Vec<u8> {
    let mut contents: Vec<Vec<u8>> = Vec::new();
    contents.push(
        format!("BT\n/F1 24 Tf\n72 720 Td\n({heading}) Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n")
            .into_bytes(),
    );
    let mut p = 0;
    while p * LINES_PER_PAGE < LINES.len() {
        let end = usize::min((p + 1) * LINES_PER_PAGE, LINES.len());
        let mut s = format!("BT\n/F1 {FONT_SIZE} Tf\n72 {TOP_Y} Td\n");
        for (i, line) in LINES[p * LINES_PER_PAGE..end].iter().enumerate() {
            if i == 0 {
                s.push_str(&format!("({line}) Tj\n"));
            } else {
                s.push_str(&format!("0 -{LINE_STEP} Td\n({line}) Tj\n"));
            }
        }
        s.push_str("ET\n");
        contents.push(s.into_bytes());
        p += 1;
    }
    let num_pages = contents.len();

    let mut objects: Vec<Vec<u8>> = Vec::new();
    objects.push(b"<< /Type /Catalog /Pages 2 0 R >>".to_vec()); // 1

    // Page objects at 5, 7, 9, … (content streams at 6, 8, 10, …).
    let mut kids = String::new();
    for i in 0..num_pages {
        if i > 0 {
            kids.push(' ');
        }
        kids.push_str(&format!("{} 0 R", 5 + 2 * i));
    }
    objects.push(format!("<< /Type /Pages /Kids [{kids}] /Count {num_pages} >>").into_bytes()); // 2
    objects.push(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>".to_vec()); // 3
    let mut img = format!(
        "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB \
/BitsPerComponent 8 /Filter /DCTDecode /Length {} >>\nstream\n",
        JPEG.len()
    )
    .into_bytes();
    img.extend_from_slice(JPEG);
    img.extend_from_slice(b"\nendstream");
    objects.push(img); // 4
    for i in 0..num_pages {
        objects.push(
            format!(
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> /XObject << /Im1 4 0 R >> >> /Contents {} 0 R >>",
                6 + 2 * i
            )
            .into_bytes(),
        );
        let c = &contents[i];
        let mut co = format!("<< /Length {} >>\nstream\n", c.len()).into_bytes();
        co.extend_from_slice(c);
        co.extend_from_slice(b"endstream");
        objects.push(co);
    }

    let mut buf: Vec<u8> = Vec::with_capacity(JPEG.len() + LINES.len() * 80 + 8192);
    buf.extend_from_slice(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n");
    let mut offsets = Vec::with_capacity(objects.len());
    for (i, body) in objects.iter().enumerate() {
        offsets.push(buf.len());
        buf.extend_from_slice(format!("{} 0 obj\n", i + 1).as_bytes());
        buf.extend_from_slice(body);
        buf.extend_from_slice(b"\nendobj\n");
    }
    let xref_off = buf.len();
    let n = objects.len();
    buf.extend_from_slice(format!("xref\n0 {}\n0000000000 65535 f\r\n", n + 1).as_bytes());
    for off in offsets {
        buf.extend_from_slice(format!("{off:010} 00000 n\r\n").as_bytes());
    }
    buf.extend_from_slice(
        format!("trailer\n<< /Size {} /Root 1 0 R >>\nstartxref\n{xref_off}\n%%EOF\n", n + 1)
            .as_bytes(),
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
