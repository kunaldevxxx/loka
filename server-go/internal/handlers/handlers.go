package handlers

import (
	"math/rand"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kunaldevxxx/loka-backend-go/internal/auth"
	"github.com/kunaldevxxx/loka-backend-go/internal/db"
	"github.com/kunaldevxxx/loka-backend-go/internal/models"
	"github.com/kunaldevxxx/loka-backend-go/internal/pricing"
)

type Handler struct {
	store     db.Store
	jwtSecret string
}

func NewHandler(store db.Store, jwtSecret string) *Handler {
	return &Handler{
		store:     store,
		jwtSecret: jwtSecret,
	}
}

// Health Check
func (h *Handler) Health(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"ok":        true,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"engine":    "golang-fiber",
	})
}

// GET /api/cafes
func (h *Handler) GetCafes(c *fiber.Ctx) error {
	cafes := h.store.GetCafes()
	return c.JSON(fiber.Map{"cafes": cafes})
}

// GET /api/menu?cafeId=...
func (h *Handler) GetMenu(c *fiber.Ctx) error {
	cafeId := c.Query("cafeId", "cafe-001")
	items := h.store.GetMenuItems(cafeId)

	// Collect unique categories
	categorySet := make(map[string]bool)
	var categories []string
	for _, it := range items {
		if !categorySet[it.Category] {
			categorySet[it.Category] = true
			categories = append(categories, it.Category)
		}
	}

	return c.JSON(fiber.Map{
		"cafeId":     cafeId,
		"categories": categories,
		"items":      items,
	})
}

// POST /api/sessions
func (h *Handler) CreateSession(c *fiber.Ctx) error {
	var body struct {
		CafeId   string `json:"cafeId"`
		TableId  string `json:"tableId"`
		DeviceId string `json:"deviceId"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	sessionToken := "sess_" + uuid.New().String()
	now := time.Now().UTC()
	session := models.Session{
		SessionToken: sessionToken,
		CafeId:       body.CafeId,
		TableId:      body.TableId,
		DeviceId:     body.DeviceId,
		CreatedAt:    now.Format(time.RFC3339),
		ExpiresAt:    now.Add(24 * time.Hour).Format(time.RFC3339),
	}
	h.store.CreateSession(session)

	return c.JSON(fiber.Map{
		"sessionToken": sessionToken,
		"cafeId":       body.CafeId,
		"tableId":      body.TableId,
		"deviceId":     body.DeviceId,
	})
}

// POST /api/orders
func (h *Handler) CreateOrder(c *fiber.Ctx) error {
	var req models.CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid order payload"})
	}

	if req.CafeId == "" || req.DeviceId == "" || len(req.Items) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Missing required fields (cafeId, deviceId, items)"})
	}

	// Fetch menu catalog for pricing validation
	menuItems := h.store.GetMenuItems(req.CafeId)
	menuMap := make(map[string]models.MenuItem)
	for _, m := range menuItems {
		menuMap[m.ItemId] = m
	}

	// Check returning status
	device, exists := h.store.GetDevice(req.DeviceId, req.CafeId)
	isReturning := exists && device.Granted

	processedItems, subtotal, gst, loyaltyDiscount, total, err := pricing.CalculatePricing(req.Items, menuMap, isReturning)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// Update device visit record
	h.store.UpsertDevice(models.Device{
		DeviceId: req.DeviceId,
		CafeId:   req.CafeId,
		Granted:  true,
	})

	orderId := "ord-" + uuid.New().String()[:8]
	confCode := strconv.Itoa(1000 + rand.Intn(9000))
	now := time.Now().UTC().Format(time.RFC3339)

	paymentMethod := req.PaymentMethod
	if paymentMethod == "" {
		paymentMethod = "upi"
	}

	order := models.Order{
		Id:                     orderId,
		CafeId:                 req.CafeId,
		DeviceId:               req.DeviceId,
		TableId:                req.TableId,
		Items:                  processedItems,
		Subtotal:               subtotal,
		GST:                    gst,
		LoyaltyDiscount:        loyaltyDiscount,
		Total:                  total,
		PaymentMethod:          paymentMethod,
		PaymentStatus:          "paid",
		KitchenStatus:          "confirmed",
		PointsEarned:           total / 10,
		ConfirmationCode:       confCode,
		IsReturningAtOrderTime: isReturning,
		ConfirmedAt:            &now,
		CreatedAt:              now,
		StatusTimestamps: models.OrderStatusTimestamps{
			Created:   now,
			Confirmed: &now,
		},
	}

	created := h.store.CreateOrder(order)
	return c.Status(201).JSON(created)
}

// GET /api/orders/:id
func (h *Handler) GetOrder(c *fiber.Ctx) error {
	orderId := c.Params("id")
	order, exists := h.store.GetOrderById(orderId)
	if !exists {
		return c.Status(404).JSON(fiber.Map{"error": "Order not found"})
	}
	return c.JSON(order)
}

// POST /api/auth/register
func (h *Handler) Register(c *fiber.Ctx) error {
	var body models.AuthRequest
	if err := c.BodyParser(&body); err != nil || body.Email == "" || body.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email and password are required"})
	}

	if _, exists := h.store.GetUserByEmail(body.Email); exists {
		return c.Status(409).JSON(fiber.Map{"error": "User with this email already exists"})
	}

	role := body.Role
	if role == "" {
		role = "customer"
	}

	var cafeIdPtr *string
	if body.CafeId != "" {
		cafeIdPtr = &body.CafeId
	}

	user := models.User{
		Email:    body.Email,
		Password: body.Password,
		Name:     body.Name,
		Role:     role,
		CafeId:   cafeIdPtr,
	}
	created := h.store.CreateUser(user)

	token, err := auth.GenerateToken(created, h.jwtSecret)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.Status(201).JSON(models.AuthResponse{
		Token: token,
		User:  created,
	})
}

// POST /api/auth/login
func (h *Handler) Login(c *fiber.Ctx) error {
	var body models.AuthRequest
	if err := c.BodyParser(&body); err != nil || body.Email == "" || body.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email and password are required"})
	}

	user, exists := h.store.GetUserByEmail(body.Email)
	if !exists || user.Password != body.Password {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid email or password"})
	}

	token, err := auth.GenerateToken(*user, h.jwtSecret)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

// POST /api/auth/google
func (h *Handler) GoogleLogin(c *fiber.Ctx) error {
	var body struct {
		IdToken string `json:"idToken"`
	}
	_ = c.BodyParser(&body)

	user, exists := h.store.GetUserByEmail("user@example.com")
	if !exists {
		newUser := h.store.CreateUser(models.User{
			Email: "user@example.com",
			Name:  "Google User",
			Role:  "customer",
		})
		user = &newUser
	}

	token, err := auth.GenerateToken(*user, h.jwtSecret)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

// GET /api/staff/kds
func (h *Handler) GetKDS(c *fiber.Ctx) error {
	userClaim := c.Locals("user").(*auth.Claims)
	cafeId := ""
	if userClaim.CafeId != nil {
		cafeId = *userClaim.CafeId
	}

	orders := h.store.GetOrders(cafeId)
	return c.JSON(fiber.Map{
		"cafeId": cafeId,
		"orders": orders,
	})
}

// PATCH /api/staff/orders/:id/status
func (h *Handler) UpdateOrderStatus(c *fiber.Ctx) error {
	orderId := c.Params("id")
	var body struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil || body.Status == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Status is required"})
	}

	updated, exists := h.store.UpdateOrderStatus(orderId, body.Status)
	if !exists {
		return c.Status(404).JSON(fiber.Map{"error": "Order not found"})
	}

	return c.JSON(updated)
}

// GET /api/staff/overview
func (h *Handler) GetStaffOverview(c *fiber.Ctx) error {
	userClaim := c.Locals("user").(*auth.Claims)
	cafeId := ""
	if userClaim.CafeId != nil {
		cafeId = *userClaim.CafeId
	}

	orders := h.store.GetOrders(cafeId)
	totalRevenue := 0
	activeOrdersCount := 0

	for _, o := range orders {
		totalRevenue += o.Total
		if o.KitchenStatus == "confirmed" || o.KitchenStatus == "preparing" || o.KitchenStatus == "ready" {
			activeOrdersCount++
		}
	}

	return c.JSON(fiber.Map{
		"cafeId":            cafeId,
		"totalRevenue":      totalRevenue,
		"totalOrders":       len(orders),
		"activeOrdersCount": activeOrdersCount,
		"avgPrepTimeMins":   12,
		"paymentBreakdown": fiber.Map{
			"upi":  int(float64(totalRevenue) * 0.7),
			"card": int(float64(totalRevenue) * 0.2),
			"cash": int(float64(totalRevenue) * 0.1),
		},
	})
}

// POST /api/admin/cafes (Global Support Role Only)
func (h *Handler) CreateCafe(c *fiber.Ctx) error {
	var cafe models.Cafe
	if err := c.BodyParser(&cafe); err != nil || cafe.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Venue name is required"})
	}

	created := h.store.CreateCafe(cafe)
	return c.Status(201).JSON(created)
}

// POST /api/admin/cafes/:cafeId/menu (Global Support Role Only)
func (h *Handler) CreateMenuItem(c *fiber.Ctx) error {
	cafeId := c.Params("cafeId")
	var item models.MenuItem
	if err := c.BodyParser(&item); err != nil || item.Name == "" || item.Price <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Item name and valid price are required"})
	}

	item.CafeId = cafeId
	created := h.store.CreateMenuItem(item)
	return c.Status(201).JSON(created)
}

// POST /api/complaints
func (h *Handler) CreateComplaint(c *fiber.Ctx) error {
	var comp models.Complaint
	if err := c.BodyParser(&comp); err != nil || comp.Description == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Description is required"})
	}

	created := h.store.CreateComplaint(comp)
	return c.Status(201).JSON(created)
}

// GET /api/staff/complaints
func (h *Handler) GetComplaints(c *fiber.Ctx) error {
	userClaim := c.Locals("user").(*auth.Claims)
	cafeId := ""
	if userClaim.CafeId != nil {
		cafeId = *userClaim.CafeId
	}
	complaints := h.store.GetComplaints(cafeId)
	return c.JSON(fiber.Map{"complaints": complaints})
}

// PATCH /api/staff/complaints/:id/resolve
func (h *Handler) ResolveComplaint(c *fiber.Ctx) error {
	complaintId := c.Params("id")
	userClaim := c.Locals("user").(*auth.Claims)
	resolved, ok := h.store.ResolveComplaint(complaintId, userClaim.Name)
	if !ok {
		return c.Status(404).JSON(fiber.Map{"error": "Complaint not found"})
	}
	return c.JSON(resolved)
}

// POST /api/voice/order
func (h *Handler) VoiceOrder(c *fiber.Ctx) error {
	var body struct {
		Transcript string `json:"transcript"`
		Language   string `json:"language"`
		CafeId     string `json:"cafeId"`
	}
	_ = c.BodyParser(&body)

	// Simulated voice order parser or live Sarvam mapping
	matchedItem := "Signature Velvet Cappuccino"
	matchedId := "item-001"
	if strings.Contains(strings.ToLower(body.Transcript), "croissant") {
		matchedItem = "Artisan French Butter Croissant"
		matchedId = "item-003"
	}

	return c.JSON(fiber.Map{
		"recognized": true,
		"transcript": body.Transcript,
		"parsedOrder": fiber.Map{
			"items": []fiber.Map{
				{"itemId": matchedId, "name": matchedItem, "qty": 1},
			},
		},
		"message": "Added " + matchedItem + " to your table order.",
	})
}
