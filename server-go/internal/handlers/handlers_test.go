package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/kunaldevxxx/loka-backend-go/internal/auth"
	"github.com/kunaldevxxx/loka-backend-go/internal/db"
	"github.com/kunaldevxxx/loka-backend-go/internal/models"
)

func setupTestApp() (*fiber.App, *Handler, string) {
	jwtSecret := "test-secret-key-12345"
	store := db.NewMemoryStore()
	h := NewHandler(store, jwtSecret)

	app := fiber.New()
	app.Get("/health", h.Health)
	app.Get("/api/cafes", h.GetCafes)
	app.Get("/api/menu", h.GetMenu)
	app.Post("/api/auth/login", h.Login)
	app.Post("/api/orders", h.CreateOrder)

	staff := app.Group("/api/staff", auth.Middleware(jwtSecret))
	staff.Get("/kds", auth.RequireRole("chef", "manager", "support"), h.GetKDS)

	admin := app.Group("/api/admin", auth.Middleware(jwtSecret))
	admin.Post("/cafes", auth.RequireRole("support"), h.CreateCafe)

	return app, h, jwtSecret
}

func TestHealthEndpoint(t *testing.T) {
	app, _, _ := setupTestApp()

	req := httptest.NewRequest("GET", "/health", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	var data map[string]interface{}
	_ = json.Unmarshal(body, &data)

	if data["ok"] != true || data["engine"] != "golang-fiber" {
		t.Errorf("Unexpected health response: %v", data)
	}
}

func TestGetCafes(t *testing.T) {
	app, _, _ := setupTestApp()

	req := httptest.NewRequest("GET", "/api/cafes", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	var data map[string][]models.Cafe
	_ = json.Unmarshal(body, &data)

	if len(data["cafes"]) < 5 {
		t.Errorf("Expected at least 5 cafes, got %d", len(data["cafes"]))
	}
}

func TestAuthAndProtectedRoutes(t *testing.T) {
	app, _, _ := setupTestApp()

	// 1. Login with manager credentials
	loginBody, _ := json.Marshal(map[string]string{
		"email":    "manager@cafe.com",
		"password": "managerPassword123",
	})
	req := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(loginBody))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("Login failed: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200 on login, got %d", resp.StatusCode)
	}

	var authResp models.AuthResponse
	body, _ := io.ReadAll(resp.Body)
	_ = json.Unmarshal(body, &authResp)

	if authResp.Token == "" || authResp.User.Role != "manager" {
		t.Fatalf("Invalid auth response: %+v", authResp)
	}

	// 2. Manager accesses /api/staff/kds (allowed)
	kdsReq := httptest.NewRequest("GET", "/api/staff/kds", nil)
	kdsReq.Header.Set("Authorization", "Bearer "+authResp.Token)
	kdsResp, _ := app.Test(kdsReq)

	if kdsResp.StatusCode != http.StatusOK {
		t.Errorf("Expected manager to access KDS with 200, got %d", kdsResp.StatusCode)
	}

	// 3. Manager tries to access /api/admin/cafes (support-only, should be 403 Forbidden)
	adminReq := httptest.NewRequest("POST", "/api/admin/cafes", bytes.NewReader([]byte(`{"name":"New Venue"}`)))
	adminReq.Header.Set("Authorization", "Bearer "+authResp.Token)
	adminReq.Header.Set("Content-Type", "application/json")
	adminResp, _ := app.Test(adminReq)

	if adminResp.StatusCode != http.StatusForbidden {
		t.Errorf("Expected manager to get 403 Forbidden on admin route, got %d", adminResp.StatusCode)
	}
}
