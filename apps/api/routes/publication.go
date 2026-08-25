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

func RegisterPublicationRoutes(api fiber.Router) {

	cfg := configs.Load()

	jwtService := auth.NewJWTService(cfg.JWTSecret)

	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	publicationRepo :=
		repositories.NewPublicationRepository(database.DB)

	publicationService :=
		services.NewPublicationService(publicationRepo)

	publicationHandler :=
		handlers.NewPublicationHandler(publicationService)

	admin := api.Group("/admin/publications", authMiddleware.Protect(), middleware.RequireRoles(string(models.RoleAdmin), string(models.RoleSuperAdmin)))
	admin.Post("/", publicationHandler.CreatePublication)
	admin.Get("/", publicationHandler.ListPublications)
	admin.Get("/deleted", publicationHandler.ListDeletedPublications)
	admin.Get("/:id", publicationHandler.GetPublication)
	admin.Put("/:id", publicationHandler.UpdatePublication)
	admin.Delete("/:id", publicationHandler.DeletePublication)
	admin.Patch("/:id/restore", publicationHandler.RestorePublication)
	admin.Delete("/:id/permanent", publicationHandler.PermanentDeletePublication)
}
