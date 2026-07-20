package response

import "github.com/gofiber/fiber/v2"

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
}

func Success(c *fiber.Ctx, message string, data interface{}) error {
	return c.Status(fiber.StatusOK).JSON(APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func Error(c *fiber.Ctx, status int, message string, errors interface{}) error {
	return c.Status(status).JSON(APIResponse{
		Success: false,
		Message: message,
		Errors:  errors,
	})
}

func BadRequest(c *fiber.Ctx, message string) error {
	return Error(
		c,
		fiber.StatusBadRequest,
		message,
		nil,
	)
}

func Unauthorized(c *fiber.Ctx, message string) error {
	return Error(
		c,
		fiber.StatusUnauthorized,
		message,
		nil,
	)
}

func Forbidden(c *fiber.Ctx, message string) error {
	return Error(
		c,
		fiber.StatusForbidden,
		message,
		nil,
	)
}

func NotFound(c *fiber.Ctx, message string) error {
	return Error(
		c,
		fiber.StatusNotFound,
		message,
		nil,
	)
}

func Conflict(c *fiber.Ctx, message string) error {
	return Error(
		c,
		fiber.StatusConflict,
		message,
		nil,
	)
}

func InternalServerError(c *fiber.Ctx, message string) error {
	return Error(
		c,
		fiber.StatusInternalServerError,
		message,
		nil,
	)
}
