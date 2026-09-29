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

func RegisterFocusAreaRoutes(api fiber.Router) {
	cfg := configs.Load()

	// JWT service
	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
	)

	// Authentication middleware
	authMiddleware := newAuthMiddleware(
		jwtService,
	)

	// Repository
	focusAreaRepo :=
		repositories.NewFocusAreaRepository(
			database.DB,
		)

	// Service
	focusAreaService :=
		services.NewFocusAreaService(
			focusAreaRepo,
		)

	// Handler
	focusAreaHandler :=
		handlers.NewFocusAreaHandler(
			focusAreaService,
		)

	/*
		==================================================
		PUBLIC FOCUS AREA ROUTES
		==================================================

		These routes do not require authentication.

		GET /api/v1/focus-areas
		GET /api/v1/focus-areas/:slug
	*/

	api.Get(
		"/focus-areas",
		focusAreaHandler.List,
	)

	api.Get(
		"/focus-areas/:slug",
		focusAreaHandler.GetBySlug,
	)

	/*
		==================================================
		ADMIN FOCUS AREA ROUTES
		==================================================

		All authenticated admin users can manage
		focus areas.
	*/

	focusAreaAdmin := api.Group(
		"/admin/focus-areas",
		authMiddleware.Protect(),
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
}
