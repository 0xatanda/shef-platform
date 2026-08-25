package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type PublicationHandler struct {
	service *services.PublicationService
}

func NewPublicationHandler(
	service *services.PublicationService,
) *PublicationHandler {
	return &PublicationHandler{
		service: service,
	}
}

func (h *PublicationHandler) CreatePublication(c *fiber.Ctx) error {

	var req dto.CreatePublicationRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

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
			"Invalid user id",
			nil,
		)
	}

	publication, err := h.service.CreatePublication(
		c.Context(),
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
		"Publication created successfully",
		publication,
	)
}

func (h *PublicationHandler) ListPublications(c *fiber.Ctx) error {

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	publications, err := h.service.ListPublications(
		c.Context(),
		page,
		limit,
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
		"Publications retrieved successfully",
		publications,
	)
}

func (h *PublicationHandler) GetPublication(c *fiber.Ctx) error {

	publication, err := h.service.GetPublication(
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
		"Publication retrieved successfully",
		publication,
	)
}

func (h *PublicationHandler) UpdatePublication(c *fiber.Ctx) error {

	var req dto.UpdatePublicationRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

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
			"Invalid user id",
			nil,
		)
	}

	publication, err := h.service.UpdatePublication(
		c.Context(),
		userID,
		c.Params("id"),
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
		"Publication updated successfully",
		publication,
	)
}

func (h *PublicationHandler) DeletePublication(c *fiber.Ctx) error {

	if err := h.service.DeletePublication(
		c.Context(),
		c.Params("id"),
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
		"Publication deleted successfully",
		nil,
	)
}

func (h *PublicationHandler) RestorePublication(c *fiber.Ctx) error {

	if err := h.service.RestorePublication(
		c.Context(),
		c.Params("id"),
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
		"Publication restored successfully",
		nil,
	)
}

func (h *PublicationHandler) PermanentDeletePublication(c *fiber.Ctx) error {

	if err := h.service.PermanentDeletePublication(
		c.Context(),
		c.Params("id"),
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
		"Publication permanently deleted successfully",
		nil,
	)
}

func (h *PublicationHandler) ListDeletedPublications(c *fiber.Ctx) error {

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	publications, err := h.service.ListDeletedPublications(
		c.Context(),
		page,
		limit,
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
		"Deleted publications retrieved successfully",
		publications,
	)
}
