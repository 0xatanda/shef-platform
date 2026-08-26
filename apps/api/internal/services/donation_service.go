package services

import (
	"context"
	"errors"
	"math"
	"strings"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DonationService struct {
	donations *repositories.DonationRepository
}

func NewDonationService(
	repo *repositories.DonationRepository,
) *DonationService {

	return &DonationService{
		donations: repo,
	}
}

func (s *DonationService) Create(
	ctx context.Context,
	req dto.CreateDonationRequest,
) (*dto.DonationResponse, error) {

	currency := strings.TrimSpace(req.Currency)

	if currency == "" {
		currency = "NGN"
	}

	donation := &models.Donation{
		Name:     req.Name,
		Email:    req.Email,
		Phone:    req.Phone,
		Amount:   req.Amount,
		Currency: currency,
		Message:  req.Message,
		Status:   models.DonationPending,
	}

	if err := s.donations.Create(ctx, donation); err != nil {
		return nil, err
	}

	return s.toResponse(donation), nil
}

func (s *DonationService) Get(
	ctx context.Context,
	id string,
) (*dto.DonationResponse, error) {

	donationID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid donation id")
	}

	donation, err := s.donations.FindByID(
		ctx,
		donationID,
	)

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("donation not found")
		}

		return nil, err
	}

	return s.toResponse(donation), nil
}

func (s *DonationService) List(
	ctx context.Context,
	page int,
	limit int,
) (*dto.DonationListResponse, error) {

	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 10
	}

	if limit > 100 {
		limit = 100
	}

	donations, total, err := s.donations.List(
		ctx,
		page,
		limit,
	)

	if err != nil {
		return nil, err
	}

	items := make(
		[]dto.DonationResponse,
		0,
		len(donations),
	)

	for _, donation := range donations {
		items = append(
			items,
			*s.toResponse(&donation),
		)
	}

	totalPages := int(
		math.Ceil(
			float64(total) / float64(limit),
		),
	)

	return &dto.DonationListResponse{
		Items: items,
		Pagination: dto.PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *DonationService) Update(
	ctx context.Context,
	id string,
	req dto.UpdateDonationRequest,
) (*dto.DonationResponse, error) {

	donationID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid donation id")
	}

	donation, err := s.donations.FindByID(
		ctx,
		donationID,
	)

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("donation not found")
		}

		return nil, err
	}

	status := models.DonationStatus(
		strings.ToLower(
			strings.TrimSpace(req.Status),
		),
	)

	switch status {
	case models.DonationPending,
		models.DonationContacted,
		models.DonationCompleted,
		models.DonationCancelled:

	default:
		return nil, errors.New("invalid donation status")
	}

	donation.Status = status
	donation.AdminNote = req.AdminNote

	if err := s.donations.Update(
		ctx,
		donation,
	); err != nil {
		return nil, err
	}

	return s.toResponse(donation), nil
}

func (s *DonationService) Delete(
	ctx context.Context,
	id string,
) error {

	donationID, err := uuid.Parse(id)

	if err != nil {
		return errors.New("invalid donation id")
	}

	_, err = s.donations.FindByID(
		ctx,
		donationID,
	)

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("donation not found")
		}

		return err
	}

	return s.donations.Delete(
		ctx,
		donationID,
	)
}

func (s *DonationService) toResponse(
	donation *models.Donation,
) *dto.DonationResponse {

	return &dto.DonationResponse{
		ID:        donation.ID.String(),
		Name:      donation.Name,
		Email:     donation.Email,
		Phone:     donation.Phone,
		Amount:    donation.Amount,
		Currency:  donation.Currency,
		Message:   donation.Message,
		Status:    string(donation.Status),
		AdminNote: donation.AdminNote,
		CreatedAt: donation.CreatedAt,
		UpdatedAt: donation.UpdatedAt,
	}
}
