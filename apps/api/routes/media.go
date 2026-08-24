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

func RegisterMediaRoutes(api fiber.Router) {

	cfg := configs.Load()

	jwtService := auth.NewJWTService(cfg.JWTSecret)

	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	mediaRepo := repositories.NewMediaRepository(database.DB)

	mediaService := services.NewMediaService(mediaRepo)

	mediaHandler := handlers.NewMediaHandler(mediaService)

	admin := api.Group(
		"/admin/uploads",
		authMiddleware.Protect(),
		middleware.RequireRoles(
			string(models.RoleAdmin),
			string(models.RoleSuperAdmin),
		),
	)

	admin.Post("/", mediaHandler.UploadMedia)

	admin.Get("/", mediaHandler.ListMedia)

	admin.Get("/:id", mediaHandler.GetMedia)

	admin.Delete("/:id", mediaHandler.DeleteMedia)
}
