package handlers

import (
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/internal/validators"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type AdminHandler struct {
	service  *services.AdminService
	validate *validator.Validate
}

func NewAdminHandler(
	service *services.AdminService,
) *AdminHandler {

	return &AdminHandler{
		service:  service,
		validate: validators.Validate,
	}
}

func (h *AdminHandler) Dashboard(
	c *fiber.Ctx,
) error {

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

// ListUsers lists employee/admin accounts.
func (h *AdminHandler) ListUsers(
	c *fiber.Ctx,
) error {

	page := c.QueryInt(
		"page",
		1,
	)

	limit := c.QueryInt(
		"limit",
		10,
	)

	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 10
	}

	if limit > 100 {
		limit = 100
	}

	result, err := h.service.ListUsers(
		c.UserContext(),
		page,
		limit,
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusInternalServerError,
			"Failed to retrieve users",
			nil,
		)
	}

	return response.Success(
		c,
		"Users retrieved successfully",
		result,
	)
}

// GetUser returns one employee/admin account.
func (h *AdminHandler) GetUser(
	c *fiber.Ctx,
) error {

	id, err := uuid.Parse(
		c.Params("id"),
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid user ID",
			nil,
		)
	}

	user, err := h.service.GetUser(
		c.UserContext(),
		id,
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusNotFound,
			"User not found",
			nil,
		)
	}

	return response.Success(
		c,
		"User retrieved successfully",
		user,
	)
}

// CreateUser creates an employee/admin account.
func (h *AdminHandler) CreateUser(
	c *fiber.Ctx,
) error {

	var req dto.CreateUserRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	req.FirstName = strings.TrimSpace(
		req.FirstName,
	)

	req.LastName = strings.TrimSpace(
		req.LastName,
	)

	req.Email = strings.ToLower(
		strings.TrimSpace(req.Email),
	)

	req.Role = strings.ToLower(
		strings.TrimSpace(req.Role),
	)

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid employee information",
			err.Error(),
		)
	}

	user, err := h.service.CreateUser(
		c.UserContext(),
		req,
	)
	if err != nil {

		status := fiber.StatusBadRequest

		if err == services.ErrUserAlreadyExists {
			status = fiber.StatusConflict
		}

		return response.Error(
			c,
			status,
			err.Error(),
			nil,
		)
	}

	return response.Success(
		c,
		"Employee account created successfully",
		user,
	)
}

// UpdateUser updates an employee/admin account.
func (h *AdminHandler) UpdateUser(
	c *fiber.Ctx,
) error {

	id, err := uuid.Parse(
		c.Params("id"),
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid user ID",
			nil,
		)
	}

	var req dto.UpdateUserRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	req.FirstName = strings.TrimSpace(
		req.FirstName,
	)

	req.LastName = strings.TrimSpace(
		req.LastName,
	)

	req.Role = strings.ToLower(
		strings.TrimSpace(req.Role),
	)

	if err := h.validate.Struct(req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid employee information",
			err.Error(),
		)
	}

	user, err := h.service.UpdateUser(
		c.UserContext(),
		id,
		req,
	)
	if err != nil {
		if err == services.ErrInvalidRole {
			return response.Error(
				c,
				fiber.StatusBadRequest,
				err.Error(),
				nil,
			)
		}

		return response.Error(
			c,
			fiber.StatusInternalServerError,
			"Failed to update employee",
			nil,
		)
	}

	return response.Success(
		c,
		"Employee updated successfully",
		user,
	)
}

// ChangeStatus activates/deactivates an employee.
func (h *AdminHandler) ChangeStatus(
	c *fiber.Ctx,
) error {

	id, err := uuid.Parse(
		c.Params("id"),
	)
	if err != nil {
		return response.BadRequest(
			c,
			"Invalid user ID",
		)
	}

	var req dto.ChangeUserStatusRequest

	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(
			c,
			"Invalid request body",
		)
	}

	actorIDString, ok := c.Locals(
		"user_id",
	).(string)

	if !ok {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Invalid authenticated user",
			nil,
		)
	}

	actorID, err := uuid.Parse(
		actorIDString,
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Invalid authenticated user",
			nil,
		)
	}

	user, err := h.service.ChangeStatus(
		c.UserContext(),
		actorID,
		id,
		req.IsActive,
	)
	if err != nil {

		if err == services.ErrCannotDeactivateSelf {
			return response.Error(
				c,
				fiber.StatusForbidden,
				err.Error(),
				nil,
			)
		}

		return response.Error(
			c,
			fiber.StatusBadRequest,
			err.Error(),
			nil,
		)
	}

	message := "Employee deactivated successfully"

	if req.IsActive {
		message = "Employee activated successfully"
	}

	return response.Success(
		c,
		message,
		user,
	)
}

// DeleteUser soft-deletes an employee/admin account.
func (h *AdminHandler) DeleteUser(
	c *fiber.Ctx,
) error {

	id, err := uuid.Parse(
		c.Params("id"),
	)
	if err != nil {
		return response.BadRequest(
			c,
			"Invalid user ID",
		)
	}

	actorIDString, _ := c.Locals(
		"user_id",
	).(string)

	actorID, _ := uuid.Parse(
		actorIDString,
	)

	// Prevent Super Admin from deleting themselves.
	if actorID == id {
		return response.Error(
			c,
			fiber.StatusForbidden,
			"You cannot delete your own account",
			nil,
		)
	}

	if err := h.service.DeleteUser(
		c.UserContext(),
		id,
	); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			err.Error(),
			nil,
		)
	}

	return response.Success(
		c,
		"Employee deleted successfully",
		nil,
	)
}
