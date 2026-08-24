package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type MediaHandler struct {
	service *services.MediaService
}

func NewMediaHandler(service *services.MediaService) *MediaHandler {
	return &MediaHandler{
		service: service,
	}
}

func (h *MediaHandler) UploadMedia(c *fiber.Ctx) error {

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

	file, err := c.FormFile("file")
	if err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"File is required",
			nil,
		)
	}

	media, err := h.service.UploadMedia(
		c.Context(),
		userID,
		file,
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
		"File uploaded successfully",
		media,
	)
}

func (h *MediaHandler) GetMedia(c *fiber.Ctx) error {

	media, err := h.service.GetMedia(
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
		"Media retrieved successfully",
		media,
	)
}

func (h *MediaHandler) ListMedia(c *fiber.Ctx) error {

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	result, err := h.service.ListMedia(
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
		"Media retrieved successfully",
		result,
	)
}

func (h *MediaHandler) DeleteMedia(c *fiber.Ctx) error {

	err := h.service.DeleteMedia(
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
		"Media deleted successfully",
		nil,
	)
}
