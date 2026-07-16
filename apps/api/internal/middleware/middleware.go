package middleware

import (
	"github.com/gofiber/fiber/v2"

	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberLogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

func Register(app *fiber.App) {

	app.Use(requestid.New())

	app.Use(recover.New())

	app.Use(fiberLogger.New())

	app.Use(cors.New())
}
