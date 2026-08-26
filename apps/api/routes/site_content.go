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

func RegisterSiteContentRoutes(v1 fiber.Router) {

	cfg := configs.Load()

	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
	)

	authMiddleware := middleware.NewAuthMiddleware(
		jwtService,
	)

	contentRepo := repositories.NewSiteContentRepository(
		database.DB,
	)

	contentService := services.NewSiteContentService(
		contentRepo,
	)

	contentHandler := handlers.NewSiteContentHandler(
		contentService,
	)

	// Public
	v1.Get(
		"/content/:key",
		contentHandler.GetContentByKey,
	)

	// Admin
	admin := v1.Group(
		"/admin/content",
		authMiddleware.Protect(),
		middleware.RequireRoles(
			string(models.RoleAdmin),
			string(models.RoleSuperAdmin),
		),
	)

	admin.Post(
		"/",
		contentHandler.CreateContent,
	)

	admin.Get(
		"/",
		contentHandler.ListContents,
	)

	admin.Get(
		"/:id",
		contentHandler.GetContent,
	)

	admin.Put(
		"/:id",
		contentHandler.UpdateContent,
	)

	admin.Delete(
		"/:id",
		contentHandler.DeleteContent,
	)
}
