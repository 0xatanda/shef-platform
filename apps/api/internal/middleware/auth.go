package middleware

import (
	"context"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/pkg/auth"
)

const SessionIdleTimeout = 30 * time.Minute

type AuthMiddleware struct {
	jwt      *auth.JWTService
	sessions *repositories.UserSessionRepository
	users    *repositories.UserRepository
}

func NewAuthMiddleware(
	jwt *auth.JWTService,
	sessionRepo *repositories.UserSessionRepository,
	userRepo *repositories.UserRepository,
) *AuthMiddleware {

	return &AuthMiddleware{
		jwt:      jwt,
		sessions: sessionRepo,
		users:    userRepo,
	}
}

func (m *AuthMiddleware) Protect() fiber.Handler {

	return func(c *fiber.Ctx) error {

		// --------------------------------------------------
		// 1. Get Authorization header
		// --------------------------------------------------

		header := c.Get("Authorization")

		if header == "" {
			return fiber.ErrUnauthorized
		}

		parts := strings.Fields(header)

		if len(parts) != 2 ||
			!strings.EqualFold(parts[0], "Bearer") {

			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 2. Validate JWT
		// --------------------------------------------------

		claims, err := m.jwt.ValidateToken(parts[1])

		if err != nil {
			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 3. Parse user ID
		// --------------------------------------------------

		userID, err := uuid.Parse(claims.UserID)

		if err != nil {
			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 4. Parse session ID
		// --------------------------------------------------

		sessionID, err := uuid.Parse(claims.SessionID)

		if err != nil {
			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 5. Find persisted session
		// --------------------------------------------------

		ctx := context.Background()

		session, err := m.sessions.FindByID(
			ctx,
			sessionID,
		)

		if err != nil {
			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 6. Make sure session belongs to JWT user
		// --------------------------------------------------

		if session.UserID != userID {
			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 7. Reject revoked sessions
		// --------------------------------------------------

		if session.RevokedAt != nil {
			return fiber.ErrUnauthorized
		}

		now := time.Now()

		// --------------------------------------------------
		// 8. Reject sessions past absolute expiry
		// --------------------------------------------------

		if !session.ExpiresAt.After(now) {

			// Mark the session revoked so it is no longer
			// considered active in the database.
			_ = m.sessions.Revoke(
				ctx,
				session.ID,
			)

			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 9. Reject inactive sessions
		// --------------------------------------------------

		if now.Sub(session.LastSeenAt) >
			SessionIdleTimeout {

			_ = m.sessions.Revoke(
				ctx,
				session.ID,
			)

			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 10. Verify that the user still exists and is active
		// --------------------------------------------------

		user, err := m.users.FindByID(
			ctx,
			userID,
		)

		if err != nil {
			_ = m.sessions.Revoke(
				ctx,
				session.ID,
			)

			return fiber.ErrUnauthorized
		}

		if !user.IsActive {

			_ = m.sessions.Revoke(
				ctx,
				session.ID,
			)

			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 11. Update session activity
		// --------------------------------------------------

		if err := m.sessions.UpdateLastSeen(
			ctx,
			session.ID,
			now,
		); err != nil {
			return fiber.ErrUnauthorized
		}

		// --------------------------------------------------
		// 12. Store authenticated information
		// --------------------------------------------------

		c.Locals(
			"user_id",
			claims.UserID,
		)

		c.Locals(
			"session_id",
			claims.SessionID,
		)

		c.Locals(
			"email",
			claims.Email,
		)

		c.Locals(
			"role",
			claims.Role,
		)

		return c.Next()
	}
}
