package services

import (
	"context"
	"errors"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/pkg/auth"
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

func (s *AdminService) CreateUser(
	ctx context.Context,
	req dto.CreateUserRequest,
) (*dto.UserResponse, error) {

	// Check if email already exists
	exists, err := s.users.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, errors.New("user already exists")
	}

	passwordHash, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	role := models.UserRole(req.Role)

	if !role.IsValid() {
		return nil, errors.New("invalid role")
	}

	user := &models.User{
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		PasswordHash: passwordHash,
		Role:         role,
		IsActive:     true,
	}

	if err := s.users.Create(ctx, user); err != nil {
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

func (s *AdminService) UpdateUser(
	ctx context.Context,
	id uuid.UUID,
	req dto.UpdateUserRequest,
) (*dto.UserResponse, error) {

	user, err := s.users.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	user.FirstName = req.FirstName
	user.LastName = req.LastName

	if req.Role != "" {
		user.Role = models.UserRole(req.Role)
	}

	if err := s.users.Update(ctx, user); err != nil {
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

func (s *AdminService) ChangeStatus(
	ctx context.Context,
	id uuid.UUID,
	active bool,
) (*dto.UserResponse, error) {

	user, err := s.users.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := s.users.ChangeStatus(ctx, id, active); err != nil {
		return nil, err
	}

	user.IsActive = active

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

func (s *AdminService) DeleteUser(
	ctx context.Context,
	id uuid.UUID,
) error {

	_, err := s.users.FindByID(ctx, id)
	if err != nil {
		return err
	}

	return s.users.Delete(ctx, id)
}
