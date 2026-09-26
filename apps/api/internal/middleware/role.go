package middleware

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/pkg/response"
)

var AdminRoles = []string{
	"super_admin",
	"admin",
	"editor",
	"staff",
}

func RequireAdminAccess() fiber.Handler {
	return RequireRoles(AdminRoles...)
}

func RequireSuperAdminAccess() fiber.Handler {
	return RequireRoles("super_admin")
}

func RequireRoles(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleValue := c.Locals("role")

		role, ok := roleValue.(string)

		if !ok {
			log.Printf(
				"AUTHORIZATION FAILED path=%s method=%s role_value=%v role_type=%T reason=missing_or_invalid_role",
				c.Path(),
				c.Method(),
				roleValue,
				roleValue,
			)

			return response.Error(
				c,
				fiber.StatusForbidden,
				"Forbidden",
				nil,
			)
		}

		role = strings.ToLower(
			strings.TrimSpace(role),
		)

		log.Printf(
			"AUTHORIZATION CHECK path=%s method=%s role=%q allowed_roles=%v",
			c.Path(),
			c.Method(),
			role,
			roles,
		)

		for _, allowed := range roles {
			allowed = strings.ToLower(
				strings.TrimSpace(allowed),
			)

			if role == allowed {
				log.Printf(
					"AUTHORIZATION SUCCESS path=%s method=%s role=%q",
					c.Path(),
					c.Method(),
					role,
				)

				return c.Next()
			}
		}

		log.Printf(
			"AUTHORIZATION DENIED path=%s method=%s role=%q allowed_roles=%v",
			c.Path(),
			c.Method(),
			role,
			roles,
		)

		return response.Error(
			c,
			fiber.StatusForbidden,
			"Insufficient permissions",
			nil,
		)
	}
}
