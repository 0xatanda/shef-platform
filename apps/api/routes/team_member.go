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

func RegisterTeamMemberRoutes(v1 fiber.Router) {

	cfg := configs.Load()

	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
	)

	authMiddleware := middleware.NewAuthMiddleware(
		jwtService,
	)

	repo := repositories.NewTeamMemberRepository(
		database.DB,
	)

	service := services.NewTeamMemberService(
		repo,
	)

	handler := handlers.NewTeamMemberHandler(
		service,
	)

	// Public
	v1.Get(
		"/team",
		handler.ListActive,
	)

	// Admin
	admin := v1.Group(
		"/admin/team",
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
