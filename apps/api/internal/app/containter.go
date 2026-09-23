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

	// Repositories
	UserRepo          *repositories.UserRepository
	RefreshTokenRepo  *repositories.RefreshTokenRepository
	UserSessionRepo   *repositories.UserSessionRepository
	PasswordResetRepo *repositories.PasswordResetRepository

	// Services
	AuthService  *services.AuthService
	AdminService *services.AdminService

	// Handlers
	AuthHandler  *handlers.AuthHandler
	AdminHandler *handlers.AdminHandler

	// Middleware
	AuthMiddleware *middleware.AuthMiddleware
}

func NewContainer() *Container {
	cfg := configs.Load()

	db := database.DB

	// ============================================================
	// Repositories
	// ============================================================

	userRepo := repositories.NewUserRepository(db)

	refreshRepo :=
		repositories.NewRefreshTokenRepository(db)

	sessionRepo :=
		repositories.NewUserSessionRepository(db)

	passwordResetRepo :=
		repositories.NewPasswordResetRepository(db)

	// ============================================================
	// JWT
	// ============================================================

	jwtService :=
		auth.NewJWTService(
			cfg.JWTSecret,
		)

	// ============================================================
	// Services
	// ============================================================

	authService :=
		services.NewAuthService(
			userRepo,
			sessionRepo,
			passwordResetRepo,
			jwtService,
		)

	adminService :=
		services.NewAdminService(
			userRepo,
		)

	// ============================================================
	// Middleware
	// ============================================================

	authMiddleware :=
		middleware.NewAuthMiddleware(
			jwtService,
			sessionRepo,
			userRepo,
		)

	// ============================================================
	// Handlers
	// ============================================================

	authHandler :=
		handlers.NewAuthHandler(
			authService,
		)

	adminHandler :=
		handlers.NewAdminHandler(
			adminService,
		)

	// ============================================================
	// Container
	// ============================================================

	return &Container{
		Config: cfg,

		// Repositories
		UserRepo:          userRepo,
		RefreshTokenRepo:  refreshRepo,
		UserSessionRepo:   sessionRepo,
		PasswordResetRepo: passwordResetRepo,

		// Services
		AuthService:  authService,
		AdminService: adminService,

		// Handlers
		AuthHandler:  authHandler,
		AdminHandler: adminHandler,

		// Middleware
		AuthMiddleware: authMiddleware,
	}
}
