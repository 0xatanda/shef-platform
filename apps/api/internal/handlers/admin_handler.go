package handlers

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

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

func (h *AdminHandler) ListUsers(c *fiber.Ctx) error {

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 10
	}

	if limit > 100 {
		limit = 100
	}

	res, err := h.service.ListUsers(
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
		res,
	)
}

func (h *AdminHandler) GetUser(c *fiber.Ctx) error {

	id, err := uuid.Parse(c.Params("id"))
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
