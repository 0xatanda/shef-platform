package routes

import (
	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/handlers"
	"github.com/0xatanda/shef-platform/internal/middleware"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/auth"
	"github.com/0xatanda/shef-platform/pkg/database"
	"github.com/gofiber/fiber/v2"
)

func RegisterPartnerRoutes(
	v1 fiber.Router,
) {

	cfg := configs.Load()

	jwtService := auth.NewJWTService(
		cfg.JWTSecret,
	)

	authMiddleware := middleware.NewAuthMiddleware(
		jwtService,
	)

	partnerRepo := repositories.NewPartnerRepository(
		database.DB,
	)

	partnerService := services.NewPartnerService(
		partnerRepo,
	)

	partnerHandler := handlers.NewPartnerHandler(
		partnerService,
	)

	// Public
	v1.Get("/partners", partnerHandler.ListPublicPartners)

	// Admin
	admin := v1.Group("/admin/partners", authMiddleware.Protect(), middleware.RequireRoles(string(models.RoleAdmin), string(models.RoleSuperAdmin)))
	admin.Post("/", partnerHandler.CreatePartner)
	admin.Get("/", partnerHandler.ListPartners)
	admin.Get("/:id", partnerHandler.GetPartner)
	admin.Put("/:id", partnerHandler.UpdatePartner)
	admin.Delete("/:id", partnerHandler.DeletePartner)
	admin.Patch("/:id/restore", partnerHandler.RestorePartner)
	admin.Delete("/:id/permanent", partnerHandler.PermanentDeletePartner)
}
