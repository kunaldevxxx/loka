package auth

import (
	"testing"

	"github.com/kunaldevxxx/loka-backend-go/internal/models"
)

func TestGenerateAndVerifyToken(t *testing.T) {
	secret := "test-secret-123456"
	cafeId := "cafe-001"
	user := models.User{
		Id:     "user-101",
		Email:  "manager@cafe.com",
		Role:   "manager",
		CafeId: &cafeId,
		Name:   "Aarav Sharma",
	}

	token, err := GenerateToken(user, secret)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	claims, err := VerifyToken(token, secret)
	if err != nil {
		t.Fatalf("VerifyToken failed: %v", err)
	}

	if claims.Email != user.Email || claims.Role != "manager" || *claims.CafeId != cafeId {
		t.Errorf("Claims mismatch: got %+v", claims)
	}

	// Verify failure with wrong secret
	_, err = VerifyToken(token, "wrong-secret")
	if err == nil {
		t.Errorf("Expected error when verifying with wrong secret, got nil")
	}
}
