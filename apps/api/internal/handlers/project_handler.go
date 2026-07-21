package handlers

import (
	"strconv"

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

func (h *ProjectHandler) ListProjects(c *fiber.Ctx) error {

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	search := c.Query("search")
	status := c.Query("status")

	projects, err := h.service.ListProjects(
		c.Context(),
		page,
		limit,
		search,
		status,
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
		"Projects retrieved successfully",
		projects,
	)
}

func (h *ProjectHandler) GetProject(c *fiber.Ctx) error {

	project, err := h.service.GetProject(
		c.Context(),
		c.Params("id"),
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusNotFound,
			err.Error(),
			nil,
		)
	}

	return response.Success(
		c,
		"Project retrieved successfully",
		project,
	)
}

func (h *ProjectHandler) UpdateProject(c *fiber.Ctx) error {

	var req dto.UpdateProjectRequest

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

	project, err := h.service.UpdateProject(
		c.Context(),
		c.Params("id"),
		userID,
		req,
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			err.Error(),
			nil,
		)
	}

	return response.Success(
		c,
		"Project updated successfully",
		project,
	)
}

func (h *ProjectHandler) DeleteProject(c *fiber.Ctx) error {

	err := h.service.DeleteProject(
		c.Context(),
		c.Params("id"),
	)

	if err != nil {

		if err.Error() == "invalid project id" {
			return response.Error(
				c,
				fiber.StatusBadRequest,
				err.Error(),
				nil,
			)
		}

		if err.Error() == "project not found" {
			return response.Error(
				c,
				fiber.StatusNotFound,
				err.Error(),
				nil,
			)
		}

		return response.Error(
			c,
			fiber.StatusInternalServerError,
			err.Error(),
			nil,
		)
	}

	return response.Success(
		c,
		"Project deleted successfully",
		nil,
	)
}

func (h *ProjectHandler) RestoreProject(c *fiber.Ctx) error {

	err := h.service.RestoreProject(
		c.Context(),
		c.Params("id"),
	)

	if err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			err.Error(),
			nil,
		)
	}

	return response.Success(
		c,
		"Project restored successfully",
		nil,
	)
}

func (h *ProjectHandler) PermanentDeleteProject(c *fiber.Ctx) error {

	err := h.service.PermanentDeleteProject(
		c.Context(),
		c.Params("id"),
	)

	if err != nil {

		if err.Error() == "invalid project id" {
			return response.Error(
				c,
				fiber.StatusBadRequest,
				err.Error(),
				nil,
			)
		}

		if err.Error() == "project not found or not deleted" {
			return response.Error(
				c,
				fiber.StatusNotFound,
				err.Error(),
				nil,
			)
		}

		return response.Error(
			c,
			fiber.StatusInternalServerError,
			err.Error(),
			nil,
		)
	}

	return response.Success(
		c,
		"Project permanently deleted successfully",
		nil,
	)
}

func (h *ProjectHandler) ListDeletedProjects(c *fiber.Ctx) error {

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 10
	}

	result, err := h.service.ListDeletedProjects(
		c.Context(),
		page,
		limit,
		search,
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
		"Deleted projects retrieved successfully",
		result,
	)
}
