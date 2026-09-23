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

func RegisterProjectRoutes(api fiber.Router) {
	cfg := configs.Load()

	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
	)

	authMiddleware := newAuthMiddleware(
		jwtService,
	)

	projectRepo := repositories.NewProjectRepository(
		database.DB,
	)

	contentMediaRepo := repositories.NewContentMediaRepository(
		database.DB,
	)

	projectMediaRepo := repositories.NewProjectMediaRepository(
		database.DB,
	)

	projectService := services.NewProjectService(
		projectRepo,
		projectMediaRepo,
		contentMediaRepo,
	)

	projectHandler := handlers.NewProjectHandler(
		projectService,
	)

	// =====================================================
	// PUBLIC
	// =====================================================

	api.Get(
		"/projects",
		projectHandler.ListPublishedProjects,
	)

	api.Get(
		"/projects/:slug",
		projectHandler.GetPublishedProject,
	)

	// =====================================================
	// ADMIN
	// =====================================================

	admin := api.Group(
		"/admin/projects",
		authMiddleware.Protect(),
		middleware.RequireRoles(
			string(models.RoleAdmin),
			string(models.RoleSuperAdmin),
		),
	)

	admin.Post(
		"/",
		projectHandler.CreateProject,
	)

	admin.Get(
		"/",
		projectHandler.ListProjects,
	)

	admin.Get(
		"/deleted",
		projectHandler.ListDeletedProjects,
	)

	admin.Get(
		"/:id",
		projectHandler.GetProject,
	)

	admin.Put(
		"/:id",
		projectHandler.UpdateProject,
	)

	admin.Delete(
		"/:id",
		projectHandler.DeleteProject,
	)

	admin.Patch(
		"/:id/restore",
		projectHandler.RestoreProject,
	)

	admin.Delete(
		"/:id/permanent",
		projectHandler.PermanentDeleteProject,
	)

	// =====================================================
	// PROJECT MEDIA
	// =====================================================

	admin.Post(
		"/:id/media",
		projectHandler.AddProjectMedia,
	)

	admin.Get(
		"/:id/media",
		projectHandler.ListProjectMedia,
	)

	admin.Delete(
		"/:id/media/:mediaId",
		projectHandler.DeleteProjectMedia,
	)

	admin.Patch(
		"/:id/media/:mediaId/featured",
		projectHandler.SetFeaturedProjectMedia,
	)

	admin.Patch(
		"/:id/media/order",
		projectHandler.ReorderProjectMedia,
	)
}
