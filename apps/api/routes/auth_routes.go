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

	userRepo := repositories.NewUserRepository(database.DB)
	refreshRepo := repositories.NewRefreshTokenRepository(database.DB)

	jwtService := auth.NewJWTService(cfg.JWTSecret)

	authService := services.NewAuthService(
		userRepo,
		refreshRepo,
		jwtService,
	)

	authHandler := handlers.NewAuthHandler(authService)

	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	auth := api.Group("/auth")

	auth.Post("/login", authHandler.Login)
	auth.Post("/refresh", authHandler.Refresh)
	auth.Post("/logout", authHandler.Logout)

	auth.Get(
		"/me",
		authMiddleware.Protect(),
		authHandler.Me,
	)
}
