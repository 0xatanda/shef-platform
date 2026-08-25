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

	// JWT Service
	jwtService := auth.NewJWTService(cfg.JWTSecret)

	// Middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtService)

	// Repository
	projectRepo := repositories.NewProjectRepository(database.DB)

	// Service
	projectService := services.NewProjectService(projectRepo)

	// Handler
	projectHandler := handlers.NewProjectHandler(projectService)

	admin := api.Group("/admin/projects", authMiddleware.Protect(), middleware.RequireRoles(string(models.RoleAdmin), string(models.RoleSuperAdmin)))
	admin.Post("/", projectHandler.CreateProject)
	admin.Get("/", projectHandler.ListProjects)
	admin.Get("/deleted", projectHandler.ListDeletedProjects)
	admin.Get("/:id", projectHandler.GetProject)
	admin.Put("/:id", projectHandler.UpdateProject)
	admin.Delete("/:id", projectHandler.DeleteProject)
	admin.Patch("/:id/restore", projectHandler.RestoreProject)
	admin.Delete("/:id/permanent", projectHandler.PermanentDeleteProject)
}
