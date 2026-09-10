package db

import (
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/kunaldevxxx/loka-backend-go/internal/models"
)

type MemoryStore struct {
	mu         sync.RWMutex
	cafes      []models.Cafe
	menuItems  []models.MenuItem
	orders     []models.Order
	users      []models.User
	sessions   []models.Session
	devices    []models.Device
	complaints []models.Complaint
}

func NewMemoryStore() *MemoryStore {
	m := &MemoryStore{
		cafes:      getSeedCafes(),
		menuItems:  getSeedMenuItems(),
		users:      getSeedUsers(),
		orders:     make([]models.Order, 0),
		sessions:   make([]models.Session, 0),
		devices:    make([]models.Device, 0),
		complaints: make([]models.Complaint, 0),
	}
	return m
}

func (m *MemoryStore) GetCafes() []models.Cafe {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]models.Cafe, len(m.cafes))
	copy(out, m.cafes)
	return out
}

func (m *MemoryStore) GetCafeById(cafeId string) (*models.Cafe, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, c := range m.cafes {
		if c.CafeId == cafeId {
			copy := c
			return &copy, true
		}
	}
	return nil, false
}

func (m *MemoryStore) CreateCafe(cafe models.Cafe) models.Cafe {
	m.mu.Lock()
	defer m.mu.Unlock()
	if cafe.CafeId == "" {
		cafe.CafeId = "cafe-" + uuid.New().String()[:8]
	}
	now := time.Now().UTC().Format(time.RFC3339)
	cafe.CreatedAt = now
	cafe.UpdatedAt = now
	m.cafes = append(m.cafes, cafe)
	return cafe
}

func (m *MemoryStore) GetMenuItems(cafeId string) []models.MenuItem {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []models.MenuItem
	for _, item := range m.menuItems {
		if cafeId == "" || item.CafeId == cafeId {
			result = append(result, item)
		}
	}
	return result
}

func (m *MemoryStore) GetMenuItemById(itemId string) (*models.MenuItem, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, item := range m.menuItems {
		if item.ItemId == itemId {
			copy := item
			return &copy, true
		}
	}
	return nil, false
}

func (m *MemoryStore) CreateMenuItem(item models.MenuItem) models.MenuItem {
	m.mu.Lock()
	defer m.mu.Unlock()
	if item.ItemId == "" {
		item.ItemId = "item-" + uuid.New().String()[:8]
	}
	now := time.Now().UTC().Format(time.RFC3339)
	item.CreatedAt = now
	item.UpdatedAt = now
	m.menuItems = append(m.menuItems, item)
	return item
}

func (m *MemoryStore) ToggleMenuItem(itemId string) (*models.MenuItem, bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for i := range m.menuItems {
		if m.menuItems[i].ItemId == itemId {
			m.menuItems[i].Available = !m.menuItems[i].Available
			m.menuItems[i].UpdatedAt = time.Now().UTC().Format(time.RFC3339)
			copy := m.menuItems[i]
			return &copy, true
		}
	}
	return nil, false
}

func (m *MemoryStore) GetOrders(cafeId string) []models.Order {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []models.Order
	for _, o := range m.orders {
		if cafeId == "" || o.CafeId == cafeId {
			result = append(result, o)
		}
	}
	return result
}

func (m *MemoryStore) GetOrderById(orderId string) (*models.Order, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, o := range m.orders {
		if o.Id == orderId {
			copy := o
			return &copy, true
		}
	}
	return nil, false
}

func (m *MemoryStore) CreateOrder(order models.Order) models.Order {
	m.mu.Lock()
	defer m.mu.Unlock()
	now := time.Now().UTC().Format(time.RFC3339)
	order.CreatedAt = now
	order.UpdatedAt = now
	order.StatusTimestamps.Created = now
	m.orders = append(m.orders, order)
	return order
}

func (m *MemoryStore) UpdateOrderStatus(orderId string, status string) (*models.Order, bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	now := time.Now().UTC().Format(time.RFC3339)
	for i := range m.orders {
		if m.orders[i].Id == orderId {
			m.orders[i].KitchenStatus = status
			m.orders[i].UpdatedAt = now
			switch status {
			case "confirmed":
				m.orders[i].StatusTimestamps.Confirmed = &now
			case "preparing":
				m.orders[i].StatusTimestamps.Preparing = &now
			case "ready":
				m.orders[i].StatusTimestamps.Ready = &now
			case "collected":
				m.orders[i].StatusTimestamps.Collected = &now
			case "cancelled":
				m.orders[i].StatusTimestamps.Cancelled = &now
			}
			copy := m.orders[i]
			return &copy, true
		}
	}
	return nil, false
}

func (m *MemoryStore) GetUserByEmail(email string) (*models.User, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, u := range m.users {
		if u.Email == email {
			copy := u
			return &copy, true
		}
	}
	return nil, false
}

func (m *MemoryStore) GetUserById(id string) (*models.User, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, u := range m.users {
		if u.Id == id {
			copy := u
			return &copy, true
		}
	}
	return nil, false
}

func (m *MemoryStore) CreateUser(user models.User) models.User {
	m.mu.Lock()
	defer m.mu.Unlock()
	if user.Id == "" {
		user.Id = "user-" + uuid.New().String()[:8]
	}
	user.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	m.users = append(m.users, user)
	return user
}

func (m *MemoryStore) CreateSession(session models.Session) models.Session {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.sessions = append(m.sessions, session)
	return session
}

func (m *MemoryStore) GetDevice(deviceId, cafeId string) (*models.Device, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, d := range m.devices {
		if d.DeviceId == deviceId && d.CafeId == cafeId {
			copy := d
			return &copy, true
		}
	}
	return nil, false
}

func (m *MemoryStore) UpsertDevice(device models.Device) models.Device {
	m.mu.Lock()
	defer m.mu.Unlock()
	now := time.Now().UTC().Format(time.RFC3339)
	for i := range m.devices {
		if m.devices[i].DeviceId == device.DeviceId && m.devices[i].CafeId == device.CafeId {
			m.devices[i].Granted = device.Granted
			m.devices[i].UpdatedAt = now
			return m.devices[i]
		}
	}
	device.CreatedAt = now
	device.UpdatedAt = now
	m.devices = append(m.devices, device)
	return device
}

func (m *MemoryStore) CreateComplaint(complaint models.Complaint) models.Complaint {
	m.mu.Lock()
	defer m.mu.Unlock()
	if complaint.ComplaintId == "" {
		complaint.ComplaintId = "comp-" + uuid.New().String()[:8]
	}
	complaint.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	complaint.Status = "open"
	m.complaints = append(m.complaints, complaint)
	return complaint
}

func (m *MemoryStore) GetComplaints(cafeId string) []models.Complaint {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []models.Complaint
	for _, c := range m.complaints {
		if cafeId == "" || c.CafeId == cafeId {
			result = append(result, c)
		}
	}
	return result
}

func (m *MemoryStore) ResolveComplaint(complaintId, resolvedBy string) (*models.Complaint, bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	now := time.Now().UTC().Format(time.RFC3339)
	for i := range m.complaints {
		if m.complaints[i].ComplaintId == complaintId {
			m.complaints[i].Status = "resolved"
			m.complaints[i].ResolvedAt = &now
			m.complaints[i].ResolvedBy = &resolvedBy
			copy := m.complaints[i]
			return &copy, true
		}
	}
	return nil, false
}
