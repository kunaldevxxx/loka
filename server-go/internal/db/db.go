package db

import "github.com/kunaldevxxx/loka-backend-go/internal/models"

type Store interface {
	GetCafes() []models.Cafe
	GetCafeById(cafeId string) (*models.Cafe, bool)
	CreateCafe(cafe models.Cafe) models.Cafe

	GetMenuItems(cafeId string) []models.MenuItem
	GetMenuItemById(itemId string) (*models.MenuItem, bool)
	CreateMenuItem(item models.MenuItem) models.MenuItem
	ToggleMenuItem(itemId string) (*models.MenuItem, bool)

	GetOrders(cafeId string) []models.Order
	GetOrderById(orderId string) (*models.Order, bool)
	CreateOrder(order models.Order) models.Order
	UpdateOrderStatus(orderId string, status string) (*models.Order, bool)

	GetUserByEmail(email string) (*models.User, bool)
	GetUserById(id string) (*models.User, bool)
	CreateUser(user models.User) models.User

	CreateSession(session models.Session) models.Session
	GetDevice(deviceId, cafeId string) (*models.Device, bool)
	UpsertDevice(device models.Device) models.Device

	CreateComplaint(complaint models.Complaint) models.Complaint
	GetComplaints(cafeId string) []models.Complaint
	ResolveComplaint(complaintId, resolvedBy string) (*models.Complaint, bool)
}
