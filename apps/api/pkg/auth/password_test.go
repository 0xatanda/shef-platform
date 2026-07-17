package auth

import "testing"

func TestHashPassword(t *testing.T) {
	password := "Admin@123"

	hash, err := HashPassword(password)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if hash == "" {
		t.Fatal("expected hash")
	}

	if hash == password {
		t.Fatal("password should not equal hash")
	}
}

func TestVerifyPassword(t *testing.T) {

	password := "Admin@123"

	hash, _ := HashPassword(password)

	if !VerifyPassword(hash, password) {
		t.Fatal("password verification failed")
	}
}

func TestVerifyPasswordWrongPassword(t *testing.T) {

	password := "Admin@123"

	hash, _ := HashPassword(password)

	if VerifyPassword(hash, "WrongPassword") {
		t.Fatal("verification should fail")
	}
}

func TestHashPasswordGeneratesUniqueHashes(t *testing.T) {

	password := "Admin@123"

	hash1, _ := HashPassword(password)
	hash2, _ := HashPassword(password)

	if hash1 == hash2 {
		t.Fatal("bcrypt should generate different hashes")
	}
}

func TestVerifyInvalidHash(t *testing.T) {

	if VerifyPassword("invalidhash", "password") {
		t.Fatal("invalid hash should fail")
	}
}

func TestEmptyPassword(t *testing.T) {

	hash, err := HashPassword("")

	if err != nil {
		t.Fatalf("unexpected error %v", err)
	}

	if !VerifyPassword(hash, "") {
		t.Fatal("empty password should verify")
	}
}
