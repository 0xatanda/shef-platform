package handlers

import (
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/internal/validators"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type AuthHandler struct {
	service  *services.AuthService
	validate *validator.Validate
}

func NewAuthHandler(service *services.AuthService) *AuthHandler {
	return &AuthHandler{
		service:  service,
		validate: validators.Validate,
	}
}

// POST /auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req validators.LoginRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			err.Error(),
		)
	}

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Validation failed",
			err.Error(),
		)
	}

	res, err := h.service.Login(
		c.UserContext(),
		req.Email,
		req.Password,
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			err.Error(),
			nil,
		)
	}

	return response.Success(c, "Login successful", res)
}

// POST /auth/refresh
func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	var req validators.RefreshTokenRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			err.Error(),
		)
	}

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Validation failed",
			err.Error(),
		)
	}

	res, err := h.service.Refresh(
		c.UserContext(),
		req.RefreshToken,
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			err.Error(),
			nil,
		)
	}

	return response.Success(c, "Token refreshed", res)
}

// POST /auth/logout
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var req validators.RefreshTokenRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			err.Error(),
		)
	}

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Validation failed",
			err.Error(),
		)
	}

	if err := h.service.Logout(
		c.UserContext(),
		req.RefreshToken,
	); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			err.Error(),
			nil,
		)
	}

	return response.Success(c, "Logout successful", nil)
}

// GET /auth/me
func (h *AuthHandler) Me(c *fiber.Ctx) error {

	value := c.Locals("user_id")
	if value == nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	userID, ok := value.(string)
	if !ok {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Invalid user",
			nil,
		)
	}

	id, err := uuid.Parse(userID)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Invalid user ID",
			nil,
		)
	}

	user, err := h.service.CurrentUser(
		c.UserContext(),
		id,
	)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			return response.Error(
				c,
				fiber.StatusNotFound,
				"User not found",
				nil,
			)
		}

		return response.Error(
			c,
			fiber.StatusInternalServerError,
			"Failed to retrieve user",
			nil,
		)
	}

	return response.Success(
		c,
		"Current user",
		user,
	)
}
