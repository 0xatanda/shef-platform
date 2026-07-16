package routes

import (
	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/internal/handlers"
	"github.com/0xatanda/shef-platform/internal/middleware"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/internal/services"
)

func RegisterAuthRoutes(api fiber.Router) {

	userRepo := repositories.NewUserRepository()

	refreshRepo := repositories.NewRefreshTokenRepository()

	authService := services.NewAuthService(
		userRepo,
		refreshRepo,
		"change-this-secret", // We'll replace this with config/viper later.
	)

	authHandler := handlers.NewAuthHandler(authService)

	auth := api.Group("/auth")

	auth.Post("/login", authHandler.Login)

	auth.Post("/refresh", authHandler.Refresh)

	auth.Post("/logout", authHandler.Logout)

	auth.Get(
		"/me",
		middleware.Auth(),
		authHandler.Me,
	)
}
