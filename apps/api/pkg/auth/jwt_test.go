package auth

import (
	"testing"
)

func newJWT() *JWTService {
	return NewJWTService("super-secret-key")
}

func TestGenerateAccessToken(t *testing.T) {

	jwt := newJWT()

	token, err := jwt.GenerateAccessToken(
		"123",
		"admin@shef.org",
		"admin",
	)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if token == "" {
		t.Fatal("expected token")
	}
}

func TestValidateToken(t *testing.T) {

	jwt := newJWT()

	token, _ := jwt.GenerateAccessToken(
		"123",
		"admin@shef.org",
		"admin",
	)

	claims, err := jwt.ValidateToken(token)

	if err != nil {
		t.Fatalf("expected valid token, got %v", err)
	}

	if claims.UserID != "123" {
		t.Fatalf("expected user id 123, got %s", claims.UserID)
	}

	if claims.Email != "admin@shef.org" {
		t.Fatalf("expected email mismatch")
	}

	if claims.Role != "admin" {
		t.Fatalf("expected role admin")
	}
}

func TestInvalidSecret(t *testing.T) {

	jwt1 := NewJWTService("secret-one")

	jwt2 := NewJWTService("secret-two")

	token, _ := jwt1.GenerateAccessToken(
		"1",
		"a@a.com",
		"admin",
	)

	_, err := jwt2.ValidateToken(token)

	if err == nil {
		t.Fatal("expected validation failure")
	}
}

func TestMalformedToken(t *testing.T) {

	jwt := newJWT()

	_, err := jwt.ValidateToken("this.is.not.a.jwt")

	if err == nil {
		t.Fatal("expected malformed token error")
	}
}

func TestEmptySecret(t *testing.T) {

	jwt := NewJWTService("")

	token, err := jwt.GenerateAccessToken(
		"1",
		"a@a.com",
		"admin",
	)

	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}

	if token == "" {
		t.Fatal("expected token")
	}
}

func TestEmptyClaims(t *testing.T) {

	jwt := newJWT()

	token, err := jwt.GenerateAccessToken(
		"",
		"",
		"",
	)

	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}

	if token == "" {
		t.Fatal("expected token")
	}
}
