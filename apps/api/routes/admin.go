package routes

import (
	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/handlers"
	"github.com/0xatanda/shef-platform/internal/middleware"
	"github.com/0xatanda/shef-platform/pkg/auth"
)

func RegisterAdminRoutes(api fiber.Router) {
	cfg := configs.Load()

	// JWT Service
	jwtService := auth.NewJWTService(cfg.JWTSecret)

	// Middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	// Handler
	adminHandler := handlers.NewAdminHandler()

	admin := api.Group(
		"/admin",
		authMiddleware.Protect(),
		middleware.RequireRoles("super_admin"),
	)

	// Dashboard
	admin.Get("/dashboard", adminHandler.Dashboard)

	// ----------------------------------------------------------------
	// User Management (Coming Next)
	// ----------------------------------------------------------------

	// admin.Get("/users", adminHandler.ListUsers)
	// admin.Get("/users/:id", adminHandler.GetUser)
	// admin.Post("/users", adminHandler.CreateUser)
	// admin.Put("/users/:id", adminHandler.UpdateUser)
	// admin.Patch("/users/:id/status", adminHandler.ChangeStatus)
	// admin.Delete("/users/:id", adminHandler.DeleteUser)
}
