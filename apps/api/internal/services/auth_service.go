package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/pkg/auth"
)

const AccessTokenTTL = 15 * time.Minute

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInactiveAccount    = errors.New("account is inactive")
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidToken       = errors.New("invalid refresh token")
)

type AuthService struct {
	users   *repositories.UserRepository
	refresh *repositories.RefreshTokenRepository
	jwt     *auth.JWTService
}

func NewAuthService(
	userRepo *repositories.UserRepository,
	refreshRepo *repositories.RefreshTokenRepository,
	jwtService *auth.JWTService,
) *AuthService {

	return &AuthService{
		users:   userRepo,
		refresh: refreshRepo,
		jwt:     jwtService,
	}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*dto.LoginResponse, error) {

	user, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if !user.IsActive {
		return nil, ErrInactiveAccount
	}

	if !auth.VerifyPassword(
		user.PasswordHash,
		password,
	) {
		return nil, ErrInvalidCredentials
	}

	accessToken, err := s.jwt.GenerateAccessToken(
		user.ID.String(),
		user.Email,
		string(user.Role),
	)

	if err != nil {
		return nil, err
	}

	refreshToken, hash, err := generateRefreshToken()

	if err != nil {
		return nil, err
	}

	err = s.refresh.Create(
		ctx,
		user.ID,
		hash,
		time.Now().Add(30*24*time.Hour),
	)

	if err != nil {
		return nil, err
	}

	_ = s.users.UpdateLastLogin(ctx, user.ID)

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int(AccessTokenTTL.Seconds()),
		User: dto.UserResponse{
			ID:        user.ID,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Email:     user.Email,
			Role:      string(user.Role),
		},
	}, nil
}

func (s *AuthService) CurrentUser(ctx context.Context, id uuid.UUID) (*dto.UserResponse, error) {

	user, err := s.users.FindByID(ctx, id)

	if err != nil {
		return nil, ErrUserNotFound
	}

	return &dto.UserResponse{
		ID:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
		Role:      string(user.Role),
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {

	hash := hashToken(refreshToken)

	return s.refresh.Revoke(ctx, hash)
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*dto.LoginResponse, error) {

	hash := hashToken(refreshToken)

	stored, err := s.refresh.Find(ctx, hash)

	if err != nil {
		return nil, ErrInvalidToken
	}

	if stored.Revoked || stored.ExpiresAt.Before(time.Now()) {
		return nil, ErrInvalidToken
	}

	user, err := s.users.FindByID(ctx, stored.UserID)

	if err != nil {
		return nil, ErrUserNotFound
	}

	accessToken, err := s.jwt.GenerateAccessToken(
		user.ID.String(),
		user.Email,
		string(user.Role),
	)

	if err != nil {
		return nil, err
	}

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int(AccessTokenTTL.Seconds()),
		User: dto.UserResponse{
			ID:        user.ID,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Email:     user.Email,
			Role:      string(user.Role),
		},
	}, nil
}

func generateRefreshToken() (string, string, error) {

	bytes := make([]byte, 32)

	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}

	token := hex.EncodeToString(bytes)

	hash := hashToken(token)

	return token, hash, nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
