package handlers

import (
	"errors"
	"log"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/internal/validators"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type AuthHandler struct {
	service  *services.AuthService
	validate *validator.Validate
}

func NewAuthHandler(
	service *services.AuthService,
) *AuthHandler {
	return &AuthHandler{
		service:  service,
		validate: validator.New(),
	}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req validators.LoginRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	req.Email = strings.TrimSpace(
		strings.ToLower(req.Email),
	)

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid email or password",
			nil,
		)
	}

	result, err := h.service.Login(
		c.UserContext(),
		req.Email,
		req.Password,
		c.IP(),
		c.Get("User-Agent"),
	)

	if err != nil {
		// IMPORTANT:
		// Do not log the password or password hash.
		log.Printf(
			"AUTH LOGIN FAILED email=%q ip=%q error=%v",
			req.Email,
			c.IP(),
			err,
		)

		switch {
		case errors.Is(err, services.ErrInvalidCredentials):
			return response.Error(
				c,
				fiber.StatusUnauthorized,
				"Invalid email or password",
				nil,
			)

		case errors.Is(err, services.ErrInactiveAccount):
			return response.Error(
				c,
				fiber.StatusForbidden,
				"Account is inactive",
				nil,
			)

		default:
			// During development, return a generic server
			// error instead of incorrectly reporting a
			// database/session/JWT problem as a password error.
			return response.Error(
				c,
				fiber.StatusInternalServerError,
				"Unable to complete login",
				nil,
			)
		}
	}

	return response.Success(
		c,
		"Login successful",
		result,
	)
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	var req validators.RefreshTokenRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Refresh token is required",
			nil,
		)
	}

	result, err := h.service.Refresh(
		c.UserContext(),
		req.RefreshToken,
	)

	if err != nil {
		log.Printf(
			"AUTH REFRESH FAILED ip=%q error=%v",
			c.IP(),
			err,
		)

		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Invalid or expired refresh token",
			nil,
		)
	}

	return response.Success(
		c,
		"Token refreshed successfully",
		result,
	)
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var req validators.RefreshTokenRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Refresh token is required",
			nil,
		)
	}

	if err := h.service.Logout(
		c.UserContext(),
		req.RefreshToken,
	); err != nil {
		log.Printf(
			"AUTH LOGOUT FAILED ip=%q error=%v",
			c.IP(),
			err,
		)

		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unable to logout",
			nil,
		)
	}

	return response.Success(
		c,
		"Logged out successfully",
		nil,
	)
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userIDValue := c.Locals("user_id")

	if userIDValue == nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	userIDString, ok := userIDValue.(string)

	if !ok || userIDString == "" {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	userID, err := uuid.Parse(userIDString)

	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	result, err := h.service.CurrentUser(
		c.UserContext(),
		userID,
	)

	if err != nil {
		log.Printf(
			"AUTH ME FAILED user_id=%q error=%v",
			userIDString,
			err,
		)

		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	return response.Success(
		c,
		"Current user retrieved successfully",
		result,
	)
}

func (h *AuthHandler) ChangePassword(c *fiber.Ctx) error {
	var req validators.ChangePasswordRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid password data",
			nil,
		)
	}

	userIDValue := c.Locals("user_id")

	if userIDValue == nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	userIDString, ok := userIDValue.(string)

	if !ok || userIDString == "" {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	userID, err := uuid.Parse(userIDString)

	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	if err := h.service.ChangePassword(
		c.UserContext(),
		userID,
		req.CurrentPassword,
		req.NewPassword,
	); err != nil {
		log.Printf(
			"AUTH CHANGE PASSWORD FAILED user_id=%q error=%v",
			userIDString,
			err,
		)

		switch {
		case errors.Is(err, services.ErrInvalidCredentials):
			return response.Error(
				c,
				fiber.StatusUnauthorized,
				"Current password is incorrect",
				nil,
			)

		default:
			return response.Error(
				c,
				fiber.StatusInternalServerError,
				"Unable to change password",
				nil,
			)
		}
	}

	return response.Success(
		c,
		"Password changed successfully",
		nil,
	)
}

func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
	var req validators.ForgotPasswordRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	req.Email = strings.TrimSpace(
		strings.ToLower(req.Email),
	)

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid email",
			nil,
		)
	}

	token, err := h.service.RequestPasswordReset(
		c.UserContext(),
		req.Email,
	)

	if err != nil {
		log.Printf(
			"AUTH FORGOT PASSWORD FAILED email=%q error=%v",
			req.Email,
			err,
		)

		// Do not reveal whether an account exists.
		return response.Success(
			c,
			"If the account exists, password reset instructions will be sent",
			nil,
		)
	}

	// The token is currently returned by the service so
	// the application layer can eventually hand it to
	// an email service.
	//
	// Do not expose this token in the public HTTP response
	// in production.
	_ = token

	return response.Success(
		c,
		"If the account exists, password reset instructions will be sent",
		nil,
	)
}

func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	var req validators.ResetPasswordRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid password reset data",
			nil,
		)
	}

	if err := h.service.ResetPassword(
		c.UserContext(),
		req.Token,
		req.NewPassword,
	); err != nil {
		log.Printf(
			"AUTH RESET PASSWORD FAILED error=%v",
			err,
		)

		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid or expired password reset token",
			nil,
		)
	}

	return response.Success(
		c,
		"Password reset successfully",
		nil,
	)
}

// Prevent unused import problems if dto is not currently
// referenced elsewhere in this handler file.
var _ dto.LoginResponse
