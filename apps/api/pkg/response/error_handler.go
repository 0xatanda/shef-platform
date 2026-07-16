package response

import "github.com/gofiber/fiber/v2"

func ErrorHandler(c *fiber.Ctx, err error) error {

	return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
		Success: false,
		Message: err.Error(),
	})
}
