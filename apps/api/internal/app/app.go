package app

import (
	"github.com/0xatanda/shef-platform/internal/middleware"
	"github.com/0xatanda/shef-platform/pkg/response"
	"github.com/0xatanda/shef-platform/routes"
	"github.com/gofiber/fiber/v2"
)

func New() *fiber.App {

	app := fiber.New(fiber.Config{
		ErrorHandler: response.ErrorHandler,
	})

	middleware.Register(app)

	routes.Register(app)

	return app
}
