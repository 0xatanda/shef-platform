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

	/*
		General admin area.

		All authenticated administration users can
		access the admin platform.

		Employee/user management is restricted
		separately to Super Admin below.
	*/
	admin := api.Group(
		"/admin",
		authMiddleware.Protect(),
		middleware.RequireAdminAccess(),
	)

	/*
		Dashboard

		Available to all administration users.
	*/
	admin.Get(
		"/dashboard",
		adminHandler.Dashboard,
	)

	/*
		Employee / User Management

		Super Admin only.

		Only Super Admin can:
		- list employees
		- view employee details
		- create employees
		- update employees
		- activate/deactivate employees
		- delete employees
	*/
	userAdmin := admin.Group(
		"/users",
		middleware.RequireSuperAdminAccess(),
	)

	userAdmin.Get(
		"/",
		adminHandler.ListUsers,
	)

	userAdmin.Get(
		"/:id",
		adminHandler.GetUser,
	)

	userAdmin.Post(
		"/",
		adminHandler.CreateUser,
	)

	userAdmin.Put(
		"/:id",
		adminHandler.UpdateUser,
	)

	userAdmin.Patch(
		"/:id/status",
		adminHandler.ChangeStatus,
	)

	userAdmin.Delete(
		"/:id",
		adminHandler.DeleteUser,
	)

	/*
		Focus Areas

		All administration users can manage
		content in the CMS.
	*/
	focusAreaAdmin := admin.Group(
		"/focus-areas",
		middleware.RequireAdminAccess(),
	)

	focusAreaAdmin.Get(
		"/",
		focusAreaHandler.List,
	)

	focusAreaAdmin.Get(
		"/:id",
		focusAreaHandler.Get,
	)

	focusAreaAdmin.Post(
		"/",
		focusAreaHandler.Create,
	)

	focusAreaAdmin.Put(
		"/:id",
		focusAreaHandler.Update,
	)

	focusAreaAdmin.Delete(
		"/:id",
		focusAreaHandler.Delete,
	)

	/*
		Public Focus Area endpoint.

		This remains outside the authenticated
		admin group.
	*/
	api.Get(
		"/focus-areas/:slug",
		focusAreaHandler.GetBySlug,
	)
}
