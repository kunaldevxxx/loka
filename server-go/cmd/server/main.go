package main

import (
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/kunaldevxxx/loka-backend-go/internal/auth"
	"github.com/kunaldevxxx/loka-backend-go/internal/db"
	"github.com/kunaldevxxx/loka-backend-go/internal/handlers"
)

func loadEnv() {
	paths := []string{".env", "../.env", "../../.env"}
	for _, p := range paths {
		if data, err := os.ReadFile(p); err == nil {
			for _, line := range strings.Split(string(data), "\n") {
				line = strings.TrimSpace(line)
				if line == "" || strings.HasPrefix(line, "#") {
					continue
				}
				parts := strings.SplitN(line, "=", 2)
				if len(parts) == 2 {
					key := strings.TrimSpace(parts[0])
					val := strings.Trim(strings.TrimSpace(parts[1]), "\"'")
					if os.Getenv(key) == "" {
						os.Setenv(key, val)
					}
				}
			}
			break
		}
	}
}

func main() {
	loadEnv()

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "loka_super_secret_jwt_key_2026"
	}

	databaseUrl := os.Getenv("DATABASE_URL")

	var store db.Store
	if databaseUrl != "" {
		log.Println("[Database] Connecting to Supabase PostgreSQL...")
		pgStore, err := db.NewPostgresStore(databaseUrl)
		if err != nil {
			log.Printf("[Database Warning] Failed to connect to Postgres: %v. Falling back to in-memory store.\n", err)
			store = db.NewMemoryStore()
		} else {
			log.Println("[Database] Successfully connected to Supabase PostgreSQL! 🚀")
			store = pgStore
		}
	} else {
		log.Println("[Database] DATABASE_URL not set. Running with embedded in-memory store.")
		store = db.NewMemoryStore()
	}

	h := handlers.NewHandler(store, jwtSecret)

	app := fiber.New(fiber.Config{
		AppName:      "Loka Cafe Platform (Go Fiber Engine)",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	})

	app.Use(recover.New())
	app.Use(logger.New())

	// Dynamic CORS supporting Cloudflare Pages (*.pages.dev) and local dev
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "https://*.pages.dev,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With",
		AllowCredentials: true,
	}))

	// Root & Health Checks
	app.Get("/health", h.Health)
	app.Get("/api/health", h.Health)

	// API Routes Group
	api := app.Group("/api")

	// Public Customer & Discovery Routes
	api.Get("/cafes", h.GetCafes)
	api.Get("/menu", h.GetMenu)
	api.Post("/sessions", h.CreateSession)
	api.Post("/orders", h.CreateOrder)
	api.Get("/orders/:id", h.GetOrder)
	api.Post("/complaints", h.CreateComplaint)
	api.Post("/voice/order", h.VoiceOrder)

	// Auth Routes
	api.Post("/auth/register", h.Register)
	api.Post("/auth/login", h.Login)
	api.Post("/auth/google", h.GoogleLogin)

	// Staff Routes (Protected)
	staff := api.Group("/staff", auth.Middleware(jwtSecret))
	staff.Get("/overview", auth.RequireRole("manager", "support"), h.GetStaffOverview)
	staff.Get("/kds", auth.RequireRole("chef", "manager", "support"), h.GetKDS)
	staff.Patch("/orders/:id/status", auth.RequireRole("chef", "manager", "support"), h.UpdateOrderStatus)
	staff.Get("/complaints", auth.RequireRole("manager", "support"), h.GetComplaints)
	staff.Patch("/complaints/:id/resolve", auth.RequireRole("manager", "support"), h.ResolveComplaint)

	// Admin / Support Routes (Protected, Global Support Only)
	admin := api.Group("/admin", auth.Middleware(jwtSecret))
	admin.Post("/cafes", auth.RequireRole("support"), h.CreateCafe)
	admin.Post("/cafes/:cafeId/menu", auth.RequireRole("support"), h.CreateMenuItem)

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("☕ Loka Cafe Go Backend listening on 0.0.0.0:%s\n", port)
		if err := app.Listen(":" + port); err != nil {
			log.Fatalf("Server listen error: %v", err)
		}
	}()

	<-quit
	log.Println("Shutting down server gracefully...")
	_ = app.Shutdown()
	log.Println("Server gracefully stopped.")
}
