package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type ProjectHandler struct {
	service *services.ProjectService
}

func NewProjectHandler(service *services.ProjectService) *ProjectHandler {
	return &ProjectHandler{
		service: service,
	}
}

func (h *ProjectHandler) CreateProject(c *fiber.Ctx) error {

	var req dto.CreateProjectRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	// Get authenticated user ID from JWT middleware
	userIDStr, ok := c.Locals("user_id").(string)
	if !ok {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Unauthorized",
			nil,
		)
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"Invalid user ID",
			nil,
		)
	}

	project, err := h.service.CreateProject(
		c.Context(),
		userID,
		req,
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusInternalServerError,
			err.Error(),
			nil,
		)
	}

	return response.Success(
		c,
		"Project created successfully",
		project,
	)
}
