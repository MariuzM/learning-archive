use axum::extract::rejection::JsonRejection;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use garde::Validate;
use serde::Deserialize;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct Item {
    #[garde(pattern(r"^[A-Z]{3}-[0-9]{3}$"))]
    sku: String,
    #[garde(range(min = 1, max = 999))]
    qty: i64,
    #[garde(range(min = 0.0, max = 100_000.0))]
    price: f64,
}

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct Payload {
    #[garde(length(min = 3, max = 30), pattern(r"^[a-z0-9_]+$"))]
    username: String,
    #[garde(length(max = 100), pattern(r"^[^@ ]+@[^@ ]+\.[^@ ]+$"))]
    email: String,
    #[garde(range(min = 13, max = 120))]
    age: i64,
    #[garde(length(min = 8, max = 100), custom(password_complexity))]
    password: String,
    #[garde(length(max = 200), pattern(r"^https?://"))]
    website: String,
    #[garde(custom(country_valid))]
    country: String,
    #[garde(length(min = 1, max = 10), inner(length(min = 1, max = 20)))]
    tags: Vec<String>,
    #[garde(length(min = 1, max = 50), dive)]
    items: Vec<Item>,
}

fn password_complexity(v: &str, _: &()) -> garde::Result {
    let lower = v.chars().any(|c| c.is_ascii_lowercase());
    let upper = v.chars().any(|c| c.is_ascii_uppercase());
    let digit = v.chars().any(|c| c.is_ascii_digit());
    if lower && upper && digit {
        Ok(())
    } else {
        Err(garde::Error::new("must mix upper, lower, and digit"))
    }
}

fn country_valid(v: &str, _: &()) -> garde::Result {
    const COUNTRIES: [&str; 10] = [
        "US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN",
    ];
    if COUNTRIES.contains(&v) {
        Ok(())
    } else {
        Err(garde::Error::new("unknown country"))
    }
}

pub async fn validate(payload: Result<Json<Payload>, JsonRejection>) -> impl IntoResponse {
    let ok = matches!(payload, Ok(Json(p)) if p.validate().is_ok());
    let status = if ok { StatusCode::OK } else { StatusCode::BAD_REQUEST };
    (status, Json(serde_json::json!({ "valid": ok })))
}
