package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type ContentMediaHandler struct {
	service *services.ContentMediaService
}

func NewContentMediaHandler(
	service *services.ContentMediaService,
) *ContentMediaHandler {
	return &ContentMediaHandler{
		service: service,
	}
}

func getUserID(c *fiber.Ctx) (uuid.UUID, error) {
	value := c.Locals("user_id")

	switch userID := value.(type) {
	case uuid.UUID:
		return userID, nil
	case string:
		return uuid.Parse(userID)
	default:
		return uuid.Nil, fiber.ErrUnauthorized
	}
}

func (h *ContentMediaHandler) Create(c *fiber.Ctx) error {
	var req dto.CreateContentMediaRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"invalid request body",
			nil,
		)
	}

	userID, err := getUserID(c)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"invalid user",
			nil,
		)
	}

	result, err := h.service.Create(
		c.Context(),
		req,
		userID,
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
		"media created successfully",
		result,
	)
}

func (h *ContentMediaHandler) Get(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"invalid media ID",
			nil,
		)
	}

	result, err := h.service.Get(
		c.Context(),
		id,
	)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusNotFound,
			"media not found",
			nil,
		)
	}

	return response.Success(
		c,
		"media retrieved successfully",
		result,
	)
}

func (h *ContentMediaHandler) List(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	mediaType := c.Query("type")

	result, err := h.service.List(
		c.Context(),
		page,
		limit,
		mediaType,
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
		"media retrieved successfully",
		result,
	)
}

func (h *ContentMediaHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"invalid media ID",
			nil,
		)
	}

	var req dto.UpdateContentMediaRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"invalid request body",
			nil,
		)
	}

	userID, err := getUserID(c)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			"invalid user",
			nil,
		)
	}

	result, err := h.service.Update(
		c.Context(),
		id,
		req,
		userID,
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
		"media updated successfully",
		result,
	)
}

func (h *ContentMediaHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"invalid media ID",
			nil,
		)
	}

	if err := h.service.Delete(c.Context(), id); err != nil {
		return response.Error(
			c,
			fiber.StatusInternalServerError,
			err.Error(),
			nil,
		)
	}

	return response.Success(
		c,
		"media deleted successfully",
		nil,
	)
}
