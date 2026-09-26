package handlers

import (
	"errors"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type FocusAreaHandler struct {
	service  *services.FocusAreaService
	validate *validator.Validate
}

func NewFocusAreaHandler(
	service *services.FocusAreaService,
) *FocusAreaHandler {
	return &FocusAreaHandler{
		service:  service,
		validate: validator.New(),
	}
}

func (h *FocusAreaHandler) List(
	c *fiber.Ctx,
) error {
	includeInactive := false

	if c.Query("all") == "true" {
		includeInactive = true
	}

	items, err := h.service.List(
		c.Context(),
		includeInactive,
	)

	if err != nil {
		return fiber.NewError(
			fiber.StatusInternalServerError,
			"Unable to load focus areas",
		)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    items,
	})
}

func (h *FocusAreaHandler) Get(
	c *fiber.Ctx,
) error {
	id, err := uuid.Parse(
		c.Params("id"),
	)

	if err != nil {
		return fiber.NewError(
			fiber.StatusBadRequest,
			"Invalid focus area ID",
		)
	}

	item, err := h.service.GetByID(
		c.Context(),
		id,
	)

	if err != nil {
		if errors.Is(
			err,
			services.ErrFocusAreaNotFound,
		) {
			return fiber.NewError(
				fiber.StatusNotFound,
				"Focus area not found",
			)
		}

		return fiber.NewError(
			fiber.StatusInternalServerError,
			"Unable to load focus area",
		)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    item,
	})
}

func (h *FocusAreaHandler) Create(
	c *fiber.Ctx,
) error {
	var req dto.CreateFocusAreaRequest

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(
			fiber.StatusBadRequest,
			"Invalid request body",
		)
	}

	if err := h.validate.Struct(req); err != nil {
		return fiber.NewError(
			fiber.StatusBadRequest,
			"Invalid focus area data",
		)
	}

	item, err := h.service.Create(
		c.Context(),
		req,
	)

	if err != nil {
		if errors.Is(
			err,
			services.ErrFocusAreaTitle,
		) ||
			errors.Is(
				err,
				services.ErrFocusAreaSlug,
			) {
			return fiber.NewError(
				fiber.StatusBadRequest,
				err.Error(),
			)
		}

		return fiber.NewError(
			fiber.StatusInternalServerError,
			"Unable to create focus area",
		)
	}

	return c.Status(
		fiber.StatusCreated,
	).JSON(fiber.Map{
		"success": true,
		"data":    item,
	})
}

func (h *FocusAreaHandler) Update(
	c *fiber.Ctx,
) error {
	id, err := uuid.Parse(
		c.Params("id"),
	)

	if err != nil {
		return fiber.NewError(
			fiber.StatusBadRequest,
			"Invalid focus area ID",
		)
	}

	var req dto.UpdateFocusAreaRequest

	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(
			fiber.StatusBadRequest,
			"Invalid request body",
		)
	}

	item, err := h.service.Update(
		c.Context(),
		id,
		req,
	)

	if err != nil {
		if errors.Is(
			err,
			services.ErrFocusAreaNotFound,
		) {
			return fiber.NewError(
				fiber.StatusNotFound,
				"Focus area not found",
			)
		}

		if errors.Is(
			err,
			services.ErrFocusAreaTitle,
		) ||
			errors.Is(
				err,
				services.ErrFocusAreaSlug,
			) {
			return fiber.NewError(
				fiber.StatusBadRequest,
				err.Error(),
			)
		}

		return fiber.NewError(
			fiber.StatusInternalServerError,
			"Unable to update focus area",
		)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    item,
	})
}

func (h *FocusAreaHandler) Delete(
	c *fiber.Ctx,
) error {
	id, err := uuid.Parse(
		c.Params("id"),
	)

	if err != nil {
		return fiber.NewError(
			fiber.StatusBadRequest,
			"Invalid focus area ID",
		)
	}

	if err := h.service.Delete(
		c.Context(),
		id,
	); err != nil {
		return fiber.NewError(
			fiber.StatusInternalServerError,
			"Unable to delete focus area",
		)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Focus area deleted successfully",
	})
}

func (h *FocusAreaHandler) GetBySlug(
	c *fiber.Ctx,
) error {
	slug := c.Params("slug")

	item, err := h.service.GetBySlug(
		c.Context(),
		slug,
	)

	if err != nil {
		if errors.Is(
			err,
			services.ErrFocusAreaNotFound,
		) {
			return fiber.NewError(
				fiber.StatusNotFound,
				"Focus area not found",
			)
		}

		return fiber.NewError(
			fiber.StatusInternalServerError,
			"Unable to load focus area",
		)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    item,
	})
}
