package routes

import (
	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/handlers"
	"github.com/0xatanda/shef-platform/internal/middleware"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/auth"
	"github.com/0xatanda/shef-platform/pkg/database"
)

func RegisterAuthRoutes(api fiber.Router) {

	cfg := configs.Load()

	db := database.DB

	// Repositories
	userRepo := repositories.NewUserRepository(db)
	refreshRepo := repositories.NewRefreshTokenRepository(db)

	// JWT Service
	jwtService := auth.NewJWTService(cfg.JWTSecret)

	// Auth Service
	authService := services.NewAuthService(
		userRepo,
		refreshRepo,
		jwtService,
	)

	// Handler
	authHandler := handlers.NewAuthHandler(authService)

	// Middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	authGroup := api.Group("/auth")

	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/refresh", authHandler.Refresh)
	authGroup.Post("/logout", authHandler.Logout)

	authGroup.Get(
		"/me",
		authMiddleware.Protect(),
		authHandler.Me,
	)
}
