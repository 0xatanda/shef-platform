package middleware

import "github.com/gofiber/fiber/v2"

func Auth() fiber.Handler {
	return func(c *fiber.Ctx) error {

		// Temporary middleware.
		// JWT validation will be added next.

		c.Locals("user_id", "")

		return c.Next()
	}
}
