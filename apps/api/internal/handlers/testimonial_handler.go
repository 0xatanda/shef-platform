package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type TestimonialHandler struct {
	service *services.TestimonialService
}

func NewTestimonialHandler(
	service *services.TestimonialService,
) *TestimonialHandler {

	return &TestimonialHandler{
		service: service,
	}
}

func (h *TestimonialHandler) Create(
	c *fiber.Ctx,
) error {

	var req dto.CreateTestimonialRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	testimonial, err := h.service.Create(
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
		"Testimonial created successfully",
		testimonial,
	)
}

func (h *TestimonialHandler) List(
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
		"Testimonials retrieved successfully",
		result,
	)
}

func (h *TestimonialHandler) ListActive(
	c *fiber.Ctx,
) error {

	result, err := h.service.ListActive(
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
		"Active testimonials retrieved successfully",
		result,
	)
}

func (h *TestimonialHandler) Get(
	c *fiber.Ctx,
) error {

	testimonial, err := h.service.Get(
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
		"Testimonial retrieved successfully",
		testimonial,
	)
}

func (h *TestimonialHandler) Update(
	c *fiber.Ctx,
) error {

	var req dto.UpdateTestimonialRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	testimonial, err := h.service.Update(
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
		"Testimonial updated successfully",
		testimonial,
	)
}

func (h *TestimonialHandler) Delete(
	c *fiber.Ctx,
) error {

	if err := h.service.Delete(
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
		"Testimonial deleted successfully",
		nil,
	)
}
