package handlers

import (
	"github.com/0xatanda/shef-platform/pkg/response"
	"github.com/gofiber/fiber/v2"
)

func Health(c *fiber.Ctx) error {

	return response.Success(c, "API is running", fiber.Map{
		"status":  "ok",
		"service": "SHEF API",
		"version": "1.0.0",
	})
}
