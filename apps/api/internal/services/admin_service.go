package services

import (
	"context"
	"errors"
	"strings"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/pkg/auth"
	"github.com/google/uuid"
)

var (
	ErrUserAlreadyExists = errors.New(
		"user already exists",
	)

	ErrInvalidRole = errors.New(
		"invalid role",
	)

	ErrCannotDeactivateSelf = errors.New(
		"you cannot deactivate your own account",
	)
)

type AdminService struct {
	users    UserRepository
	sessions UserSessionRepository
}

func NewAdminService(
	users UserRepository,
	sessions UserSessionRepository,
) *AdminService {

	return &AdminService{
		users:    users,
		sessions: sessions,
	}
}

// ListUsers returns users with pagination.
func (s *AdminService) ListUsers(
	ctx context.Context,
	page int,
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

	items := make(
		[]dto.UserListItem,
		0,
		len(users),
	)

	for _, user := range users {

		var lastLogin *string

		if user.LastLogin != nil {
			value := user.LastLogin.
				UTC().
				Format("2006-01-02T15:04:05Z")

			lastLogin = &value
		}

		items = append(
			items,
			dto.UserListItem{
				ID:            user.ID,
				FirstName:     user.FirstName,
				LastName:      user.LastName,
				Email:         user.Email,
				Role:          string(user.Role),
				IsActive:      user.IsActive,
				EmailVerified: user.EmailVerified,
				LastLogin:     lastLogin,
			},
		)
	}

	return &dto.UserListResponse{
		Items: items,
		Page:  page,
		Limit: limit,
		Total: total,
	}, nil
}

// GetUser returns a single user.
func (s *AdminService) GetUser(
	ctx context.Context,
	id uuid.UUID,
) (*dto.UserResponse, error) {

	user, err := s.users.FindByID(
		ctx,
		id,
	)

	if err != nil {
		return nil, err
	}

	return toUserResponse(user), nil
}

// CreateUser creates a new employee/admin account.
func (s *AdminService) CreateUser(
	ctx context.Context,
	req dto.CreateUserRequest,
) (*dto.UserResponse, error) {

	req.FirstName = strings.TrimSpace(
		req.FirstName,
	)

	req.LastName = strings.TrimSpace(
		req.LastName,
	)

	req.Email = strings.ToLower(
		strings.TrimSpace(req.Email),
	)

	req.Role = strings.ToLower(
		strings.TrimSpace(req.Role),
	)

	if req.FirstName == "" {
		return nil, errors.New(
			"first name is required",
		)
	}

	if req.LastName == "" {
		return nil, errors.New(
			"last name is required",
		)
	}

	if req.Email == "" {
		return nil, errors.New(
			"email is required",
		)
	}

	if req.Password == "" {
		return nil, errors.New(
			"password is required",
		)
	}

	if len(req.Password) < 12 {
		return nil, errors.New(
			"password must be at least 12 characters",
		)
	}

	if req.Role == "" {
		return nil, errors.New(
			"role is required",
		)
	}

	exists, err := s.users.ExistsByEmail(
		ctx,
		req.Email,
	)

	if err != nil {
		return nil, err
	}

	if exists {
		return nil, ErrUserAlreadyExists
	}

	role := models.UserRole(req.Role)

	if !role.IsValid() {
		return nil, ErrInvalidRole
	}

	passwordHash, err := auth.HashPassword(
		req.Password,
	)

	if err != nil {
		return nil, err
	}

	user := &models.User{
		ID:            uuid.New(),
		FirstName:     req.FirstName,
		LastName:      req.LastName,
		Email:         req.Email,
		PasswordHash:  passwordHash,
		Role:          role,
		IsActive:      true,
		EmailVerified: false,
	}

	if err := s.users.Create(
		ctx,
		user,
	); err != nil {
		return nil, err
	}

	return toUserResponse(user), nil
}

// UpdateUser updates an employee/admin account.
func (s *AdminService) UpdateUser(
	ctx context.Context,
	id uuid.UUID,
	req dto.UpdateUserRequest,
) (*dto.UserResponse, error) {

	user, err := s.users.FindByID(
		ctx,
		id,
	)

	if err != nil {
		return nil, err
	}

	req.FirstName = strings.TrimSpace(
		req.FirstName,
	)

	req.LastName = strings.TrimSpace(
		req.LastName,
	)

	req.Role = strings.ToLower(
		strings.TrimSpace(req.Role),
	)

	if req.FirstName == "" {
		return nil, errors.New(
			"first name is required",
		)
	}

	if req.LastName == "" {
		return nil, errors.New(
			"last name is required",
		)
	}

	user.FirstName = req.FirstName
	user.LastName = req.LastName

	if req.Role != "" {

		role := models.UserRole(req.Role)

		if !role.IsValid() {
			return nil, ErrInvalidRole
		}

		user.Role = role
	}

	if err := s.users.Update(
		ctx,
		user,
	); err != nil {
		return nil, err
	}

	return toUserResponse(user), nil
}

// ChangeStatus activates or deactivates a user.
//
// actorID is the currently authenticated Super Admin.
// This prevents the Super Admin from accidentally
// deactivating their own account.
func (s *AdminService) ChangeStatus(
	ctx context.Context,
	actorID uuid.UUID,
	id uuid.UUID,
	active bool,
) (*dto.UserResponse, error) {

	user, err := s.users.FindByID(
		ctx,
		id,
	)

	if err != nil {
		return nil, err
	}

	if actorID == id && !active {
		return nil, ErrCannotDeactivateSelf
	}

	if err := s.users.ChangeStatus(
		ctx,
		id,
		active,
	); err != nil {
		return nil, err
	}

	user.IsActive = active

	// Immediately revoke all active sessions when
	// an employee is deactivated.
	if !active && s.sessions != nil {

		if err := s.sessions.RevokeByUserID(
			ctx,
			id,
		); err != nil {
			return nil, err
		}
	}

	return toUserResponse(user), nil
}

// DeleteUser soft-deletes a user.
func (s *AdminService) DeleteUser(
	ctx context.Context,
	id uuid.UUID,
) error {

	if _, err := s.users.FindByID(
		ctx,
		id,
	); err != nil {
		return err
	}

	// Revoke active sessions before deletion.
	if s.sessions != nil {

		if err := s.sessions.RevokeByUserID(
			ctx,
			id,
		); err != nil {
			return err
		}
	}

	return s.users.Delete(
		ctx,
		id,
	)
}

func toUserResponse(
	user *models.User,
) *dto.UserResponse {

	return &dto.UserResponse{
		ID:            user.ID,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Email:         user.Email,
		Role:          string(user.Role),
		IsActive:      user.IsActive,
		EmailVerified: user.EmailVerified,
	}
}
