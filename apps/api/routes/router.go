package routes

import (
	"github.com/0xatanda/shef-platform/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func Register(app *fiber.App) {

	app.Get("/health", handlers.Health)

	api := app.Group("/api")

	v1 := api.Group("/v1")

	RegisterAuthRoutes(v1)
	RegisterAdminRoutes(v1)
	RegisterProjectRoutes(v1)
	RegisterMediaRoutes(v1)
	RegisterPublicationRoutes(v1)
	RegisterPartnerRoutes(v1)
}
