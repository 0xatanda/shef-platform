package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type TeamMemberHandler struct {
	service *services.TeamMemberService
}

func NewTeamMemberHandler(
	service *services.TeamMemberService,
) *TeamMemberHandler {
	return &TeamMemberHandler{
		service: service,
	}
}

func (h *TeamMemberHandler) Create(
	c *fiber.Ctx,
) error {

	var req dto.CreateTeamMemberRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	member, err := h.service.Create(
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
		"Team member created successfully",
		member,
	)
}

func (h *TeamMemberHandler) List(
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
		"Team members retrieved successfully",
		result,
	)
}

func (h *TeamMemberHandler) ListActive(
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
		"Active team members retrieved successfully",
		result,
	)
}

func (h *TeamMemberHandler) Get(
	c *fiber.Ctx,
) error {

	member, err := h.service.Get(
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
		"Team member retrieved successfully",
		member,
	)
}

func (h *TeamMemberHandler) Update(
	c *fiber.Ctx,
) error {

	var req dto.UpdateTeamMemberRequest

	if err := c.BodyParser(&req); err != nil {
		return response.Error(
			c,
			fiber.StatusBadRequest,
			"Invalid request body",
			nil,
		)
	}

	member, err := h.service.Update(
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
		"Team member updated successfully",
		member,
	)
}

func (h *TeamMemberHandler) Delete(
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
		"Team member deleted successfully",
		nil,
	)
}
