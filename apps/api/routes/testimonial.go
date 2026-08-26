package routes

import (
	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/handlers"
	"github.com/0xatanda/shef-platform/internal/middleware"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/auth"
	"github.com/0xatanda/shef-platform/pkg/database"
)

func RegisterTestimonialRoutes(v1 fiber.Router) {

	cfg := configs.Load()

	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
	)

	authMiddleware := middleware.NewAuthMiddleware(
		jwtService,
	)

	repo := repositories.NewTestimonialRepository(
		database.DB,
	)

	service := services.NewTestimonialService(
		repo,
	)

	handler := handlers.NewTestimonialHandler(
		service,
	)

	// Public
	v1.Get(
		"/testimonials",
		handler.ListActive,
	)

	// Admin
	admin := v1.Group(
		"/admin/testimonials",
		authMiddleware.Protect(),
		middleware.RequireRoles(
			string(models.RoleAdmin),
			string(models.RoleSuperAdmin),
		),
	)

	admin.Post("/", handler.Create)

	admin.Get("/", handler.List)

	admin.Get("/:id", handler.Get)

	admin.Put("/:id", handler.Update)

	admin.Delete("/:id", handler.Delete)
}
