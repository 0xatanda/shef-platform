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

func RegisterAdminContactRoutes(v1 fiber.Router) {

	cfg := configs.Load()

	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
	)

	authMiddleware := middleware.NewAuthMiddleware(
		jwtService,
	)

	contactRepo := repositories.NewContactRepository(
		database.DB,
	)

	contactService := services.NewContactService(
		contactRepo,
	)

	contactHandler := handlers.NewContactHandler(
		contactService,
	)

	v1.Post("/contact", contactHandler.CreateContact)

	admin := v1.Group(
		"/admin/contacts",
		authMiddleware.Protect(),
		middleware.RequireRoles(
			string(models.RoleAdmin),
			string(models.RoleSuperAdmin),
		),
	)

	admin.Get("/", contactHandler.ListContacts)
	admin.Get("/:id", contactHandler.GetContact)
	admin.Patch("/:id/read", contactHandler.MarkAsRead)
	admin.Delete("/:id", contactHandler.DeleteContact)
}
