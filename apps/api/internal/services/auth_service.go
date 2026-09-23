package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/pkg/auth"
)

const (
	AccessTokenTTL     = 15 * time.Minute
	SessionTTL         = 30 * 24 * time.Hour
	SessionIdleTimeout = 30 * time.Minute

	PasswordResetTTL = 30 * time.Minute
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInactiveAccount    = errors.New("account is inactive")
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidToken       = errors.New("invalid refresh token")
	ErrSessionExpired     = errors.New("session expired")
	ErrSessionInactive    = errors.New("session inactive")

	ErrInvalidPasswordResetToken = errors.New(
		"invalid or expired password reset token",
	)

	ErrPasswordMismatch = errors.New(
		"current password is incorrect",
	)

	ErrSamePassword = errors.New(
		"new password must be different from current password",
	)

	ErrWeakPassword = errors.New(
		"password does not meet security requirements",
	)
)

type AuthService struct {
	users         *repositories.UserRepository
	sessions      *repositories.UserSessionRepository
	passwordReset *repositories.PasswordResetRepository
	jwt           *auth.JWTService
}

func NewAuthService(
	userRepo *repositories.UserRepository,
	sessionRepo *repositories.UserSessionRepository,
	passwordResetRepo *repositories.PasswordResetRepository,
	jwtService *auth.JWTService,
) *AuthService {
	return &AuthService{
		users:         userRepo,
		sessions:      sessionRepo,
		passwordReset: passwordResetRepo,
		jwt:           jwtService,
	}
}

// ============================================================
// LOGIN
// ============================================================

func (s *AuthService) Login(
	ctx context.Context,
	email string,
	password string,
	ipAddress string,
	userAgent string,
) (*dto.LoginResponse, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	log.Printf(
		"AUTH LOGIN START email=%q ip=%q",
		email,
		ipAddress,
	)

	user, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		log.Printf(
			"AUTH LOGIN USER LOOKUP FAILED email=%q error=%v",
			email,
			err,
		)

		return nil, ErrInvalidCredentials
	}

	log.Printf(
		"AUTH LOGIN USER FOUND id=%s email=%q active=%t role=%s",
		user.ID.String(),
		user.Email,
		user.IsActive,
		user.Role,
	)

	if !user.IsActive {
		log.Printf(
			"AUTH LOGIN INACTIVE ACCOUNT user_id=%s",
			user.ID.String(),
		)

		return nil, ErrInactiveAccount
	}

	if !auth.VerifyPassword(
		user.PasswordHash,
		password,
	) {
		log.Printf(
			"AUTH LOGIN PASSWORD CHECK FAILED user_id=%s",
			user.ID.String(),
		)

		return nil, ErrInvalidCredentials
	}

	log.Printf(
		"AUTH LOGIN PASSWORD CHECK SUCCESS user_id=%s",
		user.ID.String(),
	)

	refreshToken, refreshHash, err :=
		generateRefreshToken()

	if err != nil {
		log.Printf(
			"AUTH LOGIN REFRESH TOKEN GENERATION FAILED user_id=%s error=%v",
			user.ID.String(),
			err,
		)

		return nil, err
	}

	now := time.Now()

	session := &models.UserSession{
		ID:               uuid.New(),
		UserID:           user.ID,
		RefreshTokenHash: refreshHash,
		LastSeenAt:       now,
		ExpiresAt:        now.Add(SessionTTL),
		IPAddress:        ipAddress,
		UserAgent:        userAgent,
	}

	log.Printf(
		"AUTH LOGIN CREATING SESSION user_id=%s session_id=%s",
		user.ID.String(),
		session.ID.String(),
	)

	if err := s.sessions.Create(
		ctx,
		session,
	); err != nil {
		log.Printf(
			"AUTH LOGIN SESSION CREATE FAILED user_id=%s session_id=%s error=%v",
			user.ID.String(),
			session.ID.String(),
			err,
		)

		return nil, err
	}

	log.Printf(
		"AUTH LOGIN SESSION CREATED user_id=%s session_id=%s",
		user.ID.String(),
		session.ID.String(),
	)

	accessToken, err := s.jwt.GenerateAccessToken(
		user.ID.String(),
		session.ID.String(),
		user.Email,
		string(user.Role),
	)

	if err != nil {
		log.Printf(
			"AUTH LOGIN ACCESS TOKEN GENERATION FAILED user_id=%s session_id=%s error=%v",
			user.ID.String(),
			session.ID.String(),
			err,
		)

		_ = s.sessions.Revoke(
			ctx,
			session.ID,
		)

		return nil, err
	}

	if err := s.users.UpdateLastLogin(
		ctx,
		user.ID,
	); err != nil {
		log.Printf(
			"AUTH LOGIN LAST LOGIN UPDATE FAILED user_id=%s error=%v",
			user.ID.String(),
			err,
		)

		// Do not fail an otherwise successful login
		// just because the audit timestamp could not
		// be updated.
	}

	log.Printf(
		"AUTH LOGIN SUCCESS user_id=%s session_id=%s",
		user.ID.String(),
		session.ID.String(),
	)

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    900,
		User: dto.UserResponse{
			ID:            user.ID,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Email:         user.Email,
			Role:          string(user.Role),
			IsActive:      user.IsActive,
			EmailVerified: user.EmailVerified,
		},
	}, nil
}

// ============================================================
// CURRENT USER
// ============================================================

func (s *AuthService) CurrentUser(
	ctx context.Context,
	id uuid.UUID,
) (*dto.UserResponse, error) {

	user, err := s.users.FindByID(
		ctx,
		id,
	)

	if err != nil {
		return nil, ErrUserNotFound
	}

	if !user.IsActive {
		return nil, ErrInactiveAccount
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

// ============================================================
// LOGOUT
// ============================================================

func (s *AuthService) Logout(
	ctx context.Context,
	refreshToken string,
) error {

	hash := hashToken(refreshToken)

	session, err :=
		s.sessions.FindByRefreshTokenHash(
			ctx,
			hash,
		)

	if err != nil {
		return ErrInvalidToken
	}

	return s.sessions.Revoke(
		ctx,
		session.ID,
	)
}

// ============================================================
// REFRESH
// ============================================================

func (s *AuthService) Refresh(
	ctx context.Context,
	refreshToken string,
) (*dto.LoginResponse, error) {

	hash := hashToken(refreshToken)

	session, err :=
		s.sessions.FindByRefreshTokenHash(
			ctx,
			hash,
		)

	if err != nil {
		return nil, ErrInvalidToken
	}

	now := time.Now()

	if session.RevokedAt != nil {
		return nil, ErrInvalidToken
	}

	if !session.ExpiresAt.After(now) {
		_ = s.sessions.Revoke(
			ctx,
			session.ID,
		)

		return nil, ErrSessionExpired
	}

	if now.Sub(session.LastSeenAt) >
		SessionIdleTimeout {

		_ = s.sessions.Revoke(
			ctx,
			session.ID,
		)

		return nil, ErrSessionInactive
	}

	user, err :=
		s.users.FindByID(
			ctx,
			session.UserID,
		)

	if err != nil {
		return nil, ErrUserNotFound
	}

	if !user.IsActive {
		_ = s.sessions.Revoke(
			ctx,
			session.ID,
		)

		return nil, ErrInactiveAccount
	}

	if err := s.sessions.UpdateLastSeen(
		ctx,
		session.ID,
		now,
	); err != nil {
		return nil, err
	}

	accessToken, err :=
		s.jwt.GenerateAccessToken(
			user.ID.String(),
			session.ID.String(),
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
			ID:            user.ID,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Email:         user.Email,
			Role:          string(user.Role),
			IsActive:      user.IsActive,
			EmailVerified: user.EmailVerified,
		},
	}, nil
}

// ============================================================
// CHANGE PASSWORD
//
// Requires the user to already be authenticated.
// ============================================================

func (s *AuthService) ChangePassword(
	ctx context.Context,
	userID uuid.UUID,
	currentPassword string,
	newPassword string,
) error {

	if !validatePassword(newPassword) {
		return ErrWeakPassword
	}

	if currentPassword == newPassword {
		return ErrSamePassword
	}

	user, err :=
		s.users.FindByID(
			ctx,
			userID,
		)

	if err != nil {
		return ErrUserNotFound
	}

	if !user.IsActive {
		return ErrInactiveAccount
	}

	if !auth.VerifyPassword(
		user.PasswordHash,
		currentPassword,
	) {
		return ErrPasswordMismatch
	}

	passwordHash, err :=
		auth.HashPassword(newPassword)

	if err != nil {
		return err
	}

	if err := s.users.UpdatePassword(
		ctx,
		user.ID,
		passwordHash,
	); err != nil {
		return err
	}

	// Changing a password invalidates every existing
	// session. The user must log in again.
	if err := s.sessions.RevokeByUserID(
		ctx,
		user.ID,
	); err != nil {
		return err
	}

	// Invalidate outstanding password reset tokens.
	_ = s.passwordReset.RevokeActiveForUser(
		ctx,
		user.ID,
	)

	return nil
}

// ============================================================
// REQUEST PASSWORD RESET
//
// IMPORTANT:
// This function intentionally returns no information that
// tells the caller whether the email exists.
//
// The actual reset token must be delivered through your
// configured email provider.
// ============================================================

func (s *AuthService) RequestPasswordReset(
	ctx context.Context,
	email string,
) (string, error) {

	email = strings.TrimSpace(
		strings.ToLower(email),
	)

	user, err :=
		s.users.FindByEmail(
			ctx,
			email,
		)

	// Do not reveal whether an account exists.
	if err != nil {
		return "", nil
	}

	if !user.IsActive {
		return "", nil
	}

	// Invalidate previous unused reset tokens.
	_ = s.passwordReset.RevokeActiveForUser(
		ctx,
		user.ID,
	)

	token, tokenHash, err :=
		generatePasswordResetToken()

	if err != nil {
		return "", err
	}

	resetToken := &models.PasswordResetToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(
			PasswordResetTTL,
		),
	}

	if err := s.passwordReset.Create(
		ctx,
		resetToken,
	); err != nil {
		return "", err
	}

	/*
	 * IMPORTANT:
	 *
	 * Do NOT return this token from the HTTP endpoint
	 * in production.
	 *
	 * This return value exists so the application layer
	 * can pass the token to an email service.
	 */
	return token, nil
}

// ============================================================
// RESET PASSWORD
//
// Uses a single-use, expiring reset token.
// ============================================================

func (s *AuthService) ResetPassword(
	ctx context.Context,
	token string,
	newPassword string,
) error {

	if !validatePassword(newPassword) {
		return ErrWeakPassword
	}

	token = strings.TrimSpace(token)

	if token == "" {
		return ErrInvalidPasswordResetToken
	}

	tokenHash := hashToken(token)

	resetToken, err :=
		s.passwordReset.FindByHash(
			ctx,
			tokenHash,
		)

	if err != nil {
		return ErrInvalidPasswordResetToken
	}

	if resetToken.UsedAt != nil {
		return ErrInvalidPasswordResetToken
	}

	if !resetToken.ExpiresAt.After(
		time.Now(),
	) {
		return ErrInvalidPasswordResetToken
	}

	user, err :=
		s.users.FindByID(
			ctx,
			resetToken.UserID,
		)

	if err != nil {
		return ErrUserNotFound
	}

	if !user.IsActive {
		return ErrInactiveAccount
	}

	// Do not allow the user to reset to the same password.
	if auth.VerifyPassword(
		user.PasswordHash,
		newPassword,
	) {
		return ErrSamePassword
	}

	passwordHash, err :=
		auth.HashPassword(newPassword)

	if err != nil {
		return err
	}

	if err := s.users.UpdatePassword(
		ctx,
		user.ID,
		passwordHash,
	); err != nil {
		return err
	}

	// Mark reset token as consumed.
	if err := s.passwordReset.MarkUsed(
		ctx,
		resetToken.ID,
	); err != nil {
		return err
	}

	// Password reset invalidates all existing sessions.
	if err := s.sessions.RevokeByUserID(
		ctx,
		user.ID,
	); err != nil {
		return err
	}

	return nil
}

// ============================================================
// PASSWORD VALIDATION
// ============================================================

func validatePassword(
	password string,
) bool {

	password = strings.TrimSpace(password)

	if len(password) < 12 {
		return false
	}

	if len(password) > 100 {
		return false
	}

	return true
}

// ============================================================
// REFRESH TOKEN
// ============================================================

func generateRefreshToken() (
	string,
	string,
	error,
) {

	bytes := make([]byte, 32)

	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}

	token := hex.EncodeToString(bytes)

	hash := hashToken(token)

	return token, hash, nil
}

// ============================================================
// PASSWORD RESET TOKEN
// ============================================================

func generatePasswordResetToken() (
	string,
	string,
	error,
) {

	bytes := make([]byte, 32)

	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}

	token := hex.EncodeToString(bytes)

	hash := hashToken(token)

	return token, hash, nil
}

// ============================================================
// SHA-256 TOKEN HASH
//
// Refresh/reset tokens are random high-entropy secrets.
// SHA-256 is appropriate for storing their hashes because
// these tokens are not human-memorable passwords.
// ============================================================

func hashToken(
	token string,
) string {

	sum := sha256.Sum256(
		[]byte(token),
	)

	return hex.EncodeToString(
		sum[:],
	)
}
