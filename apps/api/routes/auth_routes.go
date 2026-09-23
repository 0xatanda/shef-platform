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

func RegisterAuthRoutes(
	api fiber.Router,
) {

	cfg := configs.Load()

	userRepo := repositories.NewUserRepository(
		database.DB,
	)

	sessionRepo :=
		repositories.NewUserSessionRepository(
			database.DB,
		)

	passwordResetRepo :=
		repositories.NewPasswordResetRepository(
			database.DB,
		)

	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
	)

	authService := services.NewAuthService(
		userRepo,
		sessionRepo,
		passwordResetRepo,
		jwtService,
	)

	authHandler := handlers.NewAuthHandler(
		authService,
	)

	authMiddleware :=
		middleware.NewAuthMiddleware(
			jwtService,
			sessionRepo,
			userRepo,
		)

	auth := api.Group("/auth")

	// Public authentication endpoints.
	auth.Post(
		"/login",
		authHandler.Login,
	)

	auth.Post(
		"/refresh",
		authHandler.Refresh,
	)

	auth.Post(
		"/logout",
		authHandler.Logout,
	)

	auth.Post(
		"/forgot-password",
		authHandler.ForgotPassword,
	)

	auth.Post(
		"/reset-password",
		authHandler.ResetPassword,
	)

	// Authenticated endpoints.
	protected := auth.Group(
		"",
		authMiddleware.Protect(),
	)

	protected.Get(
		"/me",
		authHandler.Me,
	)

	protected.Post(
		"/change-password",
		authHandler.ChangePassword,
	)
}
