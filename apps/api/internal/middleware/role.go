package middleware

import (
	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/pkg/response"
)

func RequireRoles(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {

		role, ok := c.Locals("role").(string)
		if !ok {
			return response.Error(
				c,
				fiber.StatusForbidden,
				"Forbidden",
				nil,
			)
		}

		for _, allowed := range roles {
			if role == allowed {
				return c.Next()
			}
		}

		return response.Error(
			c,
			fiber.StatusForbidden,
			"Insufficient permissions",
			nil,
		)
	}
}
