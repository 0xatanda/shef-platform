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

func (h *PublicationHandler) CreatePublication(
	c *fiber.Ctx,
) error {
	var req dto.CreatePublicationRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	userID, err := getAuthenticatedUserID(c)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			err.Error(),
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

func (h *PublicationHandler) ListPublishedPublications(
	c *fiber.Ctx,
) error {
	page, limit := getPagination(c)

	publications, err :=
		h.service.ListPublishedPublications(
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

func (h *PublicationHandler) ListPublications(
	c *fiber.Ctx,
) error {
	page, limit := getPagination(c)

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

func (h *PublicationHandler) GetPublication(
	c *fiber.Ctx,
) error {
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

func (h *PublicationHandler) UpdatePublication(
	c *fiber.Ctx,
) error {
	var req dto.UpdatePublicationRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	userID, err := getAuthenticatedUserID(c)
	if err != nil {
		return response.Error(
			c,
			fiber.StatusUnauthorized,
			err.Error(),
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

func (h *PublicationHandler) DeletePublication(
	c *fiber.Ctx,
) error {
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
		"Publication moved to trash successfully",
		nil,
	)
}

func (h *PublicationHandler) RestorePublication(
	c *fiber.Ctx,
) error {
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

func (h *PublicationHandler) PermanentDeletePublication(
	c *fiber.Ctx,
) error {
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

func (h *PublicationHandler) ListDeletedPublications(
	c *fiber.Ctx,
) error {
	page, limit := getPagination(c)

	publications, err :=
		h.service.ListDeletedPublications(
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

func getAuthenticatedUserID(
	c *fiber.Ctx,
) (uuid.UUID, error) {
	userIDValue := c.Locals("user_id")

	switch userID := userIDValue.(type) {
	case string:
		parsedID, err := uuid.Parse(userID)
		if err != nil {
			return uuid.Nil, fiber.NewError(
				fiber.StatusUnauthorized,
				"Invalid user id",
			)
		}

		return parsedID, nil

	case uuid.UUID:
		return userID, nil

	default:
		return uuid.Nil, fiber.NewError(
			fiber.StatusUnauthorized,
			"Unauthorized",
		)
	}
}

func getPagination(
	c *fiber.Ctx,
) (int, int) {
	page, err := strconv.Atoi(
		c.Query("page", "1"),
	)
	if err != nil {
		page = 1
	}

	limit, err := strconv.Atoi(
		c.Query("limit", "10"),
	)
	if err != nil {
		limit = 10
	}

	return page, limit
}

func (h *PublicationHandler) GetPublishedPublication(
	c *fiber.Ctx,
) error {
	publication, err :=
		h.service.GetPublishedPublication(
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
