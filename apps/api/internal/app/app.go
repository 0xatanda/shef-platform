package app

import (
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/internal/middleware"
	"github.com/0xatanda/shef-platform/pkg/response"
	"github.com/0xatanda/shef-platform/routes"
)

func New() *fiber.App {

	app := fiber.New(fiber.Config{
		ErrorHandler: response.ErrorHandler,
	})

	app.Static(
		"/uploads",
		"./storage/uploads",
	)

	middleware.Register(app)

	// Register routes ONLY ONCE
	routes.Register(app)

	// Temporary: Print all routes
	for _, r := range app.GetRoutes() {
		if r.Path == "/" || r.Method == "HEAD" {
			continue
		}
		log.Printf("%-6s %s\n", r.Method, r.Path)
	}

	return app
}
