package services

import (
	"context"
	"errors"
	"math"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PartnerService struct {
	partners repositories.PartnerRepository
}

func NewPartnerService(
	partners repositories.PartnerRepository,
) *PartnerService {
	return &PartnerService{
		partners: partners,
	}
}

func (s *PartnerService) CreatePartner(
	ctx context.Context,
	req dto.CreatePartnerRequest,
) (*dto.PartnerResponse, error) {

	exists, err := s.partners.ExistsByName(ctx, req.Name)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, errors.New("partner already exists")
	}

	isActive := true

	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	partner := &models.Partner{
		Name:         req.Name,
		Logo:         req.Logo,
		Website:      req.Website,
		Description:  req.Description,
		DisplayOrder: req.DisplayOrder,
		IsActive:     isActive,
	}

	if err := s.partners.Create(ctx, partner); err != nil {
		return nil, err
	}

	return s.toResponse(partner), nil
}

func (s *PartnerService) GetPartner(
	ctx context.Context,
	id string,
) (*dto.PartnerResponse, error) {

	partnerID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid partner id")
	}

	partner, err := s.partners.FindByID(ctx, partnerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("partner not found")
		}

		return nil, err
	}

	return s.toResponse(partner), nil
}

func (s *PartnerService) ListPartners(
	ctx context.Context,
	page int,
	limit int,
) (*dto.PartnerListResponse, error) {

	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 10
	}

	if limit > 100 {
		limit = 100
	}

	partners, total, err := s.partners.List(
		ctx,
		page,
		limit,
		false,
	)

	if err != nil {
		return nil, err
	}

	items := make([]dto.PartnerResponse, 0, len(partners))

	for i := range partners {
		items = append(items, *s.toResponse(&partners[i]))
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &dto.PartnerListResponse{
		Items: items,
		Pagination: dto.PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *PartnerService) ListPublicPartners(
	ctx context.Context,
) ([]dto.PartnerResponse, error) {

	partners, err := s.partners.ListPublic(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]dto.PartnerResponse, 0, len(partners))

	for i := range partners {
		result = append(
			result,
			*s.toResponse(&partners[i]),
		)
	}

	return result, nil
}

func (s *PartnerService) UpdatePartner(
	ctx context.Context,
	id string,
	req dto.UpdatePartnerRequest,
) (*dto.PartnerResponse, error) {

	partnerID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid partner id")
	}

	partner, err := s.partners.FindByID(ctx, partnerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("partner not found")
		}

		return nil, err
	}

	if partner.Name != req.Name {

		exists, err := s.partners.ExistsByNameExceptID(
			ctx,
			req.Name,
			partnerID,
		)

		if err != nil {
			return nil, err
		}

		if exists {
			return nil, errors.New("partner name already exists")
		}
	}

	partner.Name = req.Name
	partner.Logo = req.Logo
	partner.Website = req.Website
	partner.Description = req.Description
	partner.DisplayOrder = req.DisplayOrder

	if req.IsActive != nil {
		partner.IsActive = *req.IsActive
	}

	if err := s.partners.Update(ctx, partner); err != nil {
		return nil, err
	}

	return s.toResponse(partner), nil
}

func (s *PartnerService) DeletePartner(
	ctx context.Context,
	id string,
) error {

	partnerID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid partner id")
	}

	_, err = s.partners.FindByID(ctx, partnerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("partner not found")
		}

		return err
	}

	return s.partners.Delete(ctx, partnerID)
}

func (s *PartnerService) RestorePartner(
	ctx context.Context,
	id string,
) error {

	partnerID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid partner id")
	}

	return s.partners.Restore(ctx, partnerID)
}

func (s *PartnerService) PermanentDeletePartner(
	ctx context.Context,
	id string,
) error {

	partnerID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid partner id")
	}

	return s.partners.PermanentDelete(ctx, partnerID)
}

func (s *PartnerService) toResponse(
	partner *models.Partner,
) *dto.PartnerResponse {

	return &dto.PartnerResponse{
		ID:           partner.ID.String(),
		Name:         partner.Name,
		Logo:         partner.Logo,
		Website:      partner.Website,
		Description:  partner.Description,
		DisplayOrder: partner.DisplayOrder,
		IsActive:     partner.IsActive,
		CreatedAt:    partner.CreatedAt,
		UpdatedAt:    partner.UpdatedAt,
	}
}
