package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/pkg/auth"
)

type AuthMiddleware struct {
	jwt *auth.JWTService
}

func NewAuthMiddleware(jwt *auth.JWTService) *AuthMiddleware {
	return &AuthMiddleware{
		jwt: jwt,
	}
}

func (m *AuthMiddleware) Protect() fiber.Handler {
	return func(c *fiber.Ctx) error {

		header := c.Get("Authorization")

		if header == "" {
			return fiber.ErrUnauthorized
		}

		parts := strings.Split(header, " ")

		if len(parts) != 2 || parts[0] != "Bearer" {
			return fiber.ErrUnauthorized
		}

		claims, err := m.jwt.ValidateToken(parts[1])
		if err != nil {
			return fiber.ErrUnauthorized
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}
