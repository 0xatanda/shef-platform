package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type ContactHandler struct {
	service *services.ContactService
}

func NewContactHandler(
	service *services.ContactService,
) *ContactHandler {

	return &ContactHandler{
		service: service,
	}
}

func (h *ContactHandler) CreateContact(
	c *fiber.Ctx,
) error {

	var req dto.CreateContactRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	contact, err := h.service.CreateContact(
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
		"Message sent successfully",
		contact,
	)
}

func (h *ContactHandler) ListContacts(
	c *fiber.Ctx,
) error {

	page, _ := strconv.Atoi(
		c.Query("page", "1"),
	)

	limit, _ := strconv.Atoi(
		c.Query("limit", "10"),
	)

	result, err := h.service.ListContacts(
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
		"Contacts retrieved successfully",
		result,
	)
}

func (h *ContactHandler) GetContact(
	c *fiber.Ctx,
) error {

	contact, err := h.service.GetContact(
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
		"Contact retrieved successfully",
		contact,
	)
}

func (h *ContactHandler) MarkAsRead(
	c *fiber.Ctx,
) error {

	err := h.service.MarkAsRead(
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
		"Contact marked as read",
		nil,
	)
}

func (h *ContactHandler) DeleteContact(
	c *fiber.Ctx,
) error {

	err := h.service.DeleteContact(
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
		"Contact deleted successfully",
		nil,
	)
}
