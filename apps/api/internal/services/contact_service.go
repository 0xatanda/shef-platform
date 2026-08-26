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

type ContactService struct {
	contacts *repositories.ContactRepository
}

func NewContactService(
	contactRepo *repositories.ContactRepository,
) *ContactService {

	return &ContactService{
		contacts: contactRepo,
	}
}

func (s *ContactService) CreateContact(
	ctx context.Context,
	req dto.CreateContactRequest,
) (*dto.ContactResponse, error) {

	contact := &models.Contact{
		Name:    req.Name,
		Email:   req.Email,
		Phone:   req.Phone,
		Subject: req.Subject,
		Message: req.Message,
		Status:  models.ContactUnread,
	}

	if err := s.contacts.Create(ctx, contact); err != nil {
		return nil, err
	}

	return s.toResponse(contact), nil
}

func (s *ContactService) GetContact(
	ctx context.Context,
	id string,
) (*dto.ContactResponse, error) {

	contactID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid contact id")
	}

	contact, err := s.contacts.FindByID(ctx, contactID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("contact not found")
		}

		return nil, err
	}

	return s.toResponse(contact), nil
}

func (s *ContactService) ListContacts(
	ctx context.Context,
	page int,
	limit int,
) (*dto.ContactListResponse, error) {

	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 10
	}

	if limit > 100 {
		limit = 100
	}

	contacts, total, err := s.contacts.List(
		ctx,
		page,
		limit,
	)

	if err != nil {
		return nil, err
	}

	items := make([]dto.ContactResponse, 0, len(contacts))

	for _, contact := range contacts {
		items = append(items, *s.toResponse(&contact))
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &dto.ContactListResponse{
		Items: items,
		Pagination: dto.PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *ContactService) MarkAsRead(
	ctx context.Context,
	id string,
) error {

	contactID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid contact id")
	}

	_, err = s.contacts.FindByID(ctx, contactID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("contact not found")
		}

		return err
	}

	return s.contacts.MarkAsRead(ctx, contactID)
}

func (s *ContactService) DeleteContact(
	ctx context.Context,
	id string,
) error {

	contactID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid contact id")
	}

	_, err = s.contacts.FindByID(ctx, contactID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("contact not found")
		}

		return err
	}

	return s.contacts.Delete(ctx, contactID)
}

func (s *ContactService) toResponse(
	contact *models.Contact,
) *dto.ContactResponse {

	return &dto.ContactResponse{
		ID:        contact.ID.String(),
		Name:      contact.Name,
		Email:     contact.Email,
		Phone:     contact.Phone,
		Subject:   contact.Subject,
		Message:   contact.Message,
		Status:    string(contact.Status),
		CreatedAt: contact.CreatedAt,
		UpdatedAt: contact.UpdatedAt,
	}
}
