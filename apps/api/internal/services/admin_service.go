package services

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/google/uuid"
)

type AdminService struct {
	users UserRepository
}

func NewAdminService(users UserRepository) *AdminService {
	return &AdminService{
		users: users,
	}
}

func (s *AdminService) ListUsers(
	ctx context.Context,
	page,
	limit int,
) (*dto.UserListResponse, error) {

	users, total, err := s.users.List(
		ctx,
		page,
		limit,
	)
	if err != nil {
		return nil, err
	}

	items := make([]dto.UserListItem, 0, len(users))

	for _, u := range users {
		items = append(items, dto.UserListItem{
			ID:            u.ID,
			FirstName:     u.FirstName,
			LastName:      u.LastName,
			Email:         u.Email,
			Role:          string(u.Role),
			IsActive:      u.IsActive,
			EmailVerified: u.EmailVerified,
		})
	}

	return &dto.UserListResponse{
		Items: items,
		Page:  page,
		Limit: limit,
		Total: total,
	}, nil
}

func (s *AdminService) GetUser(
	ctx context.Context,
	id uuid.UUID,
) (*dto.UserResponse, error) {

	user, err := s.users.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:            user.ID,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Email:         user.Email,
		Role:          string(user.Role),
		IsActive:      user.IsActive,
		EmailVerified: user.EmailVerified,
	}, nil
}
