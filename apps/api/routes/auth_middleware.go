package routes

import (
	"github.com/0xatanda/shef-platform/internal/middleware"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/pkg/auth"
	"github.com/0xatanda/shef-platform/pkg/database"
)

func newAuthMiddleware(
	jwtService *auth.JWTService,
) *middleware.AuthMiddleware {

	userRepo := repositories.NewUserRepository(
		database.DB,
	)

	sessionRepo := repositories.NewUserSessionRepository(
		database.DB,
	)

	return middleware.NewAuthMiddleware(
		jwtService,
		sessionRepo,
		userRepo,
	)
}
