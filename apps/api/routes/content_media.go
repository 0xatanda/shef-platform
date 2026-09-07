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

func RegisterContentMediaRoutes(api fiber.Router) {
	cfg := configs.Load()

	jwtService := auth.NewJWTService(cfg.JWTSecret)
	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	mediaRepo := repositories.NewContentMediaRepository(
		database.DB,
	)

	mediaService := services.NewContentMediaService(
		mediaRepo,
	)

	mediaHandler := handlers.NewContentMediaHandler(
		mediaService,
	)

	admin := api.Group(
		"/admin/media",
		authMiddleware.Protect(),
		middleware.RequireRoles(
			"admin",
			"super_admin",
		),
	)

	admin.Post("/", mediaHandler.Create)
	admin.Get("/", mediaHandler.List)
	admin.Get("/:id", mediaHandler.Get)
	admin.Put("/:id", mediaHandler.Update)
	admin.Delete("/:id", mediaHandler.Delete)
}
