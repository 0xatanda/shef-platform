package app

import (
	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/handlers"
	"github.com/0xatanda/shef-platform/internal/middleware"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/auth"
	"github.com/0xatanda/shef-platform/pkg/database"
)

type Container struct {
	Config *configs.Config

	// repositories
	UserRepo         *repositories.UserRepository
	RefreshTokenRepo *repositories.RefreshTokenRepository

	// services
	AuthService *services.AuthService

	// handlers
	AuthHandler  *handlers.AuthHandler
	AdminHandler *handlers.AdminHandler

	// middleware
	AuthMiddleware *middleware.AuthMiddleware
}

func NewContainer() *Container {

	cfg := configs.Load()

	db := database.DB

	// repositories
	userRepo := repositories.NewUserRepository(db)
	refreshRepo := repositories.NewRefreshTokenRepository(db)

	// jwt
	jwt := auth.NewJWTService(cfg.JWTSecret)

	// services
	authService := services.NewAuthService(
		userRepo,
		refreshRepo,
		jwt,
	)

	// handlers
	authHandler := handlers.NewAuthHandler(authService)
	adminHandler := handlers.NewAdminHandler()

	// middleware
	authMiddleware := middleware.NewAuthMiddleware(jwt)

	return &Container{
		Config: cfg,

		UserRepo:         userRepo,
		RefreshTokenRepo: refreshRepo,

		AuthService: authService,

		AuthHandler:  authHandler,
		AdminHandler: adminHandler,

		AuthMiddleware: authMiddleware,
	}
}
