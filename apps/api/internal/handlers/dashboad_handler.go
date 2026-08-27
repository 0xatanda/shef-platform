package handlers

import (
	"github.com/gofiber/fiber/v2"

	"github.com/0xatanda/shef-platform/internal/services"
	"github.com/0xatanda/shef-platform/pkg/response"
)

type DashboardHandler struct {
	service *services.DashboardService
}

func NewDashboardHandler(
	service *services.DashboardService,
) *DashboardHandler {

	return &DashboardHandler{
		service: service,
	}
}

func (h *DashboardHandler) GetDashboard(
	c *fiber.Ctx,
) error {

	dashboard, err := h.service.GetDashboard(
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
		"Dashboard retrieved successfully",
		dashboard,
	)
}
