package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type DonationHandler struct {
	service *services.DonationService
}

func NewDonationHandler(
	service *services.DonationService,
) *DonationHandler {

	return &DonationHandler{
		service: service,
	}
}

func (h *DonationHandler) Create(
	c *fiber.Ctx,
) error {

	var req dto.CreateDonationRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	donation, err := h.service.Create(
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
		"Donation request submitted successfully",
		donation,
	)
}

func (h *DonationHandler) List(
	c *fiber.Ctx,
) error {

	page, _ := strconv.Atoi(
		c.Query("page", "1"),
	)

	limit, _ := strconv.Atoi(
		c.Query("limit", "10"),
	)

	result, err := h.service.List(
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
		"Donations retrieved successfully",
		result,
	)
}

func (h *DonationHandler) Get(
	c *fiber.Ctx,
) error {

	donation, err := h.service.Get(
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
		"Donation retrieved successfully",
		donation,
	)
}

func (h *DonationHandler) Update(
	c *fiber.Ctx,
) error {

	var req dto.UpdateDonationRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	donation, err := h.service.Update(
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
		"Donation updated successfully",
		donation,
	)
}

func (h *DonationHandler) Delete(
	c *fiber.Ctx,
) error {

	err := h.service.Delete(
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
		"Donation deleted successfully",
		nil,
	)
}
