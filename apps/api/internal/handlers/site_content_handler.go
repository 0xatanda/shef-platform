package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type SiteContentHandler struct {
	service *services.SiteContentService
}

func NewSiteContentHandler(
	service *services.SiteContentService,
) *SiteContentHandler {

	return &SiteContentHandler{
		service: service,
	}
}

func (h *SiteContentHandler) CreateContent(
	c *fiber.Ctx,
) error {

	var req dto.CreateSiteContentRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	content, err := h.service.CreateContent(
		c.Context(),
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
		"Content created successfully",
		content,
	)
}

func (h *SiteContentHandler) ListContents(
	c *fiber.Ctx,
) error {

	page, _ := strconv.Atoi(
		c.Query("page", "1"),
	)

	limit, _ := strconv.Atoi(
		c.Query("limit", "10"),
	)

	result, err := h.service.ListContents(
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
		"Content retrieved successfully",
		result,
	)
}

func (h *SiteContentHandler) GetContent(
	c *fiber.Ctx,
) error {

	content, err := h.service.GetContent(
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
		"Content retrieved successfully",
		content,
	)
}

func (h *SiteContentHandler) GetContentByKey(
	c *fiber.Ctx,
) error {

	content, err := h.service.GetContentByKey(
		c.Context(),
		c.Params("key"),
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
		"Content retrieved successfully",
		content,
	)
}

func (h *SiteContentHandler) UpdateContent(
	c *fiber.Ctx,
) error {

	var req dto.UpdateSiteContentRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	content, err := h.service.UpdateContent(
		c.Context(),
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
		"Content updated successfully",
		content,
	)
}

func (h *SiteContentHandler) DeleteContent(
	c *fiber.Ctx,
) error {

	if err := h.service.DeleteContent(
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
		"Content deleted successfully",
		nil,
	)
}
