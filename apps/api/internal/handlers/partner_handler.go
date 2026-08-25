package handlers

import (
	"strconv"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
	"github.com/gofiber/fiber/v2"
)

type PartnerHandler struct {
	service *services.PartnerService
}

func NewPartnerHandler(
	service *services.PartnerService,
) *PartnerHandler {
	return &PartnerHandler{
		service: service,
	}
}

func (h *PartnerHandler) CreatePartner(
	c *fiber.Ctx,
) error {

	var req dto.CreatePartnerRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	partner, err := h.service.CreatePartner(
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
		"Partner created successfully",
		partner,
	)
}

func (h *PartnerHandler) GetPartner(
	c *fiber.Ctx,
) error {

	partner, err := h.service.GetPartner(
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
		"Partner retrieved successfully",
		partner,
	)
}

func (h *PartnerHandler) ListPartners(
	c *fiber.Ctx,
) error {

	page, _ := strconv.Atoi(
		c.Query("page", "1"),
	)

	limit, _ := strconv.Atoi(
		c.Query("limit", "10"),
	)

	result, err := h.service.ListPartners(
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
		"Partners retrieved successfully",
		result,
	)
}

func (h *PartnerHandler) ListPublicPartners(
	c *fiber.Ctx,
) error {

	partners, err := h.service.ListPublicPartners(
		c.Context(),
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
		"Partners retrieved successfully",
		partners,
	)
}

func (h *PartnerHandler) UpdatePartner(
	c *fiber.Ctx,
) error {

	var req dto.UpdatePartnerRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	partner, err := h.service.UpdatePartner(
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
		"Partner updated successfully",
		partner,
	)
}

func (h *PartnerHandler) DeletePartner(
	c *fiber.Ctx,
) error {

	if err := h.service.DeletePartner(
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
		"Partner deleted successfully",
		nil,
	)
}

func (h *PartnerHandler) RestorePartner(
	c *fiber.Ctx,
) error {

	if err := h.service.RestorePartner(
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
		"Partner restored successfully",
		nil,
	)
}

func (h *PartnerHandler) PermanentDeletePartner(
	c *fiber.Ctx,
) error {

	if err := h.service.PermanentDeletePartner(
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
		"Partner permanently deleted successfully",
		nil,
	)
}
