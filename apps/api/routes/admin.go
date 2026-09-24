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

func RegisterAdminRoutes(
	api fiber.Router,
) {

	cfg := configs.Load()

	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
	)

	authMiddleware := newAuthMiddleware(
		jwtService,
	)

	userRepo := repositories.NewUserRepository(
		database.DB,
	)

	sessionRepo := repositories.NewUserSessionRepository(
		database.DB,
	)

	adminService := services.NewAdminService(
		userRepo,
		sessionRepo,
	)

	focusAreaRepo :=
		repositories.NewFocusAreaRepository(
			database.DB,
		)

	focusAreaService :=
		services.NewFocusAreaService(
			focusAreaRepo,
		)

	focusAreaHandler :=
		handlers.NewFocusAreaHandler(
			focusAreaService,
		)

	adminHandler := handlers.NewAdminHandler(
		adminService,
	)

	admin := api.Group(
		"/admin",
		authMiddleware.Protect(),
		middleware.RequireRoles("super_admin"),
	)

	admin.Get(
		"/dashboard",
		adminHandler.Dashboard,
	)

	admin.Get(
		"/users",
		adminHandler.ListUsers,
	)

	admin.Get(
		"/users/:id",
		adminHandler.GetUser,
	)

	admin.Post(
		"/users",
		adminHandler.CreateUser,
	)

	admin.Put(
		"/users/:id",
		adminHandler.UpdateUser,
	)

	admin.Patch(
		"/users/:id/status",
		adminHandler.ChangeStatus,
	)

	admin.Delete(
		"/users/:id",
		adminHandler.DeleteUser,
	)

	admin.Get(
		"/focus-areas",
		focusAreaHandler.List,
	)

	admin.Get(
		"/focus-areas/:id",
		focusAreaHandler.Get,
	)

	admin.Post(
		"/focus-areas",
		focusAreaHandler.Create,
	)

	admin.Put(
		"/focus-areas/:id",
		focusAreaHandler.Update,
	)

	admin.Delete(
		"/focus-areas/:id",
		focusAreaHandler.Delete,
	)

	api.Get(
		"/focus-areas/:slug",
		focusAreaHandler.GetBySlug,
	)
}
