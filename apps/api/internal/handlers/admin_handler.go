package handlers

import (
	"github.com/0xatanda/shef-platform/pkg/response"
	"github.com/gofiber/fiber/v2"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

func (h *AdminHandler) Dashboard(c *fiber.Ctx) error {
	return response.Success(
		c,
		"Admin Dashboard",
		fiber.Map{
			"user_id": c.Locals("user_id"),
			"email":   c.Locals("email"),
			"role":    c.Locals("role"),
		},
	)
}
