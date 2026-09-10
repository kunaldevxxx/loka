package auth

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/kunaldevxxx/loka-backend-go/internal/models"
)

type Claims struct {
	Id     string  `json:"id"`
	Email  string  `json:"email"`
	Role   string  `json:"role"`
	CafeId *string `json:"cafeId"`
	Name   string  `json:"name"`
	jwt.RegisteredClaims
}

// GenerateToken creates a signed JWT for staff and customers
func GenerateToken(user models.User, secret string) (string, error) {
	claims := Claims{
		Id:     user.Id,
		Email:  user.Email,
		Role:   user.Role,
		CafeId: user.CafeId,
		Name:   user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(12 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// VerifyToken validates a JWT string and returns claims
func VerifyToken(tokenString string, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, fiber.ErrUnauthorized
}

// Middleware verifies Bearer token on protected routes
func Middleware(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing or malformed Authorization header",
			})
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := VerifyToken(tokenStr, secret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		c.Locals("user", claims)
		return c.Next()
	}
}

// RequireRole checks that the authenticated user possesses one of the allowed roles
func RequireRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userClaim, ok := c.Locals("user").(*Claims)
		if !ok || userClaim == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication required",
			})
		}

		for _, r := range allowedRoles {
			if userClaim.Role == r {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Insufficient permissions for this action",
		})
	}
}
